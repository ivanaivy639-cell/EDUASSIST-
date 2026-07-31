const fs = require('fs');
const readline = require('readline');
const path = require('path');

const brainDir = 'C:\\Users\\UltraBook 3.1\\.gemini\\antigravity-ide\\brain';
const outDir = 'C:\\EDUASSIST\\backend\\scratch\\exam_recovery';

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function scanTranscript(transcriptPath, filesHistory) {
    if (!fs.existsSync(transcriptPath)) return;
    
    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let stepCounter = 0;

    for await (const line of rl) {
        stepCounter++;
        if (!line.trim()) continue;
        
        let step;
        try {
            step = JSON.parse(line);
        } catch (e) {
            continue;
        }

        // We use created_at to order edits across different transcripts globally!
        const timestamp = step.created_at || new Date(0).toISOString();

        if (step.tool_calls) {
            for (const call of step.tool_calls) {
                let args = call.args || call.arguments;
                if (typeof args === 'string') {
                    try { args = JSON.parse(args); } catch(e) {}
                }
                
                if (args && args.TargetFile) {
                    let actualPath = args.TargetFile.replace(/\\\\/g, '\\');
                    if (actualPath.startsWith('"') && actualPath.endsWith('"')) {
                        actualPath = actualPath.substring(1, actualPath.length - 1);
                    }
                    
                    const targetFileLower = actualPath.toLowerCase();
                    
                    if (targetFileLower.includes('exam') || targetFileLower.includes('evaluation')) {
                        if (!filesHistory.has(actualPath)) {
                            filesHistory.set(actualPath, []);
                        }
                        
                        if (call.name === 'write_to_file' || call.name === 'default_api:write_to_file') {
                            filesHistory.get(actualPath).push({ ts: timestamp, type: 'write', content: args.CodeContent });
                        }
                        else if (call.name === 'replace_file_content' || call.name === 'default_api:replace_file_content') {
                            filesHistory.get(actualPath).push({ ts: timestamp, type: 'replace', args: args });
                        }
                        else if (call.name === 'multi_replace_file_content' || call.name === 'default_api:multi_replace_file_content') {
                            filesHistory.get(actualPath).push({ ts: timestamp, type: 'multi_replace', args: args });
                        }
                    }
                }
            }
        }
    }
}

async function recoverAll() {
    const filesHistory = new Map();
    
    const folders = fs.readdirSync(brainDir);
    for (const folder of folders) {
        const fullPath = path.join(brainDir, folder, '.system_generated', 'logs', 'transcript_full.jsonl');
        console.log(`Scanning ${fullPath}...`);
        await scanTranscript(fullPath, filesHistory);
    }
    
    let recoveredCount = 0;
    let batchScript = '@echo off\n';
    
    for (const [filePath, edits] of filesHistory.entries()) {
        // Sort edits globally by timestamp
        edits.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
        
        let currentContent = '';
        for (const edit of edits) {
            // "avant le changement d'anglais vers le francais"
            // Translation happened around 2026-07-30T00:00:00Z or somewhere
            // The step 4147 in current transcript was roughly 2026-07-29T21:00 or so.
            // Let's just apply all edits before 2026-07-30T00:00:00Z!
            if (new Date(edit.ts).getTime() > new Date('2026-07-30T00:00:00Z').getTime()) {
                break;
            }
            
            if (edit.type === 'write') {
                currentContent = edit.content;
            } else if (edit.type === 'replace') {
                const target = edit.args.TargetContent;
                const replacement = edit.args.ReplacementContent;
                if (currentContent.includes(target)) {
                    currentContent = currentContent.replace(target, replacement);
                }
            } else if (edit.type === 'multi_replace') {
                for (const chunk of edit.args.ReplacementChunks) {
                    const target = chunk.TargetContent;
                    const replacement = chunk.ReplacementContent;
                    if (currentContent.includes(target)) {
                        currentContent = currentContent.replace(target, replacement);
                    }
                }
            }
        }
        
        if (currentContent.trim().length > 0) {
            const safeName = filePath.replace(/[^a-zA-Z0-9\.-]/g, '_');
            fs.writeFileSync(path.join(outDir, safeName), currentContent);
            
            const realDir = path.dirname(filePath);
            batchScript += `if not exist "${realDir}" mkdir "${realDir}"\n`;
            batchScript += `copy /Y "${path.join(outDir, safeName)}" "${filePath}"\n`;
            
            console.log(`Recovered: ${filePath}`);
            recoveredCount++;
        }
    }
    
    fs.writeFileSync(path.join(outDir, 'restore_exam.cmd'), batchScript);
    console.log(`\nRecovered ${recoveredCount} files related to Exam module.`);
}

recoverAll().catch(console.error);
