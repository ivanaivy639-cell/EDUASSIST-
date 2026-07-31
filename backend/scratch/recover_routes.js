const fs = require('fs');
const readline = require('readline');
const path = require('path');

const brainDir = 'C:\\Users\\UltraBook 3.1\\.gemini\\antigravity-ide\\brain';
const outDir = 'C:\\EDUASSIST\\backend\\scratch\\routes_recovery';

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
                    
                    if (targetFileLower.includes('routes\\api.php') || targetFileLower.includes('routes\\web.php')) {
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
        await scanTranscript(fullPath, filesHistory);
    }
    
    for (const [filePath, edits] of filesHistory.entries()) {
        edits.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
        
        // Let's just output the RAW EDITS to a text file so I can inspect them
        let output = `File: ${filePath}\n\n`;
        for (const edit of edits) {
            if (new Date(edit.ts).getTime() > new Date('2026-07-30T00:00:00Z').getTime()) break;
            
            output += `--- [${edit.ts}] ${edit.type} ---\n`;
            if (edit.type === 'replace') {
                output += `Target: ${edit.args.TargetContent}\n`;
                output += `Replacement: ${edit.args.ReplacementContent}\n\n`;
            } else if (edit.type === 'write') {
                output += `(Skipping write to file)\n\n`;
            }
        }
        
        const safeName = filePath.replace(/[^a-zA-Z0-9\.-]/g, '_');
        fs.writeFileSync(path.join(outDir, safeName + '_edits.txt'), output);
        console.log(`Saved edits for: ${filePath}`);
    }
}

recoverAll().catch(console.error);
