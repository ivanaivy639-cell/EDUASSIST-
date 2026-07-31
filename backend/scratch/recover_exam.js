const fs = require('fs');
const readline = require('readline');
const path = require('path');

const transcriptPath = 'C:\\Users\\UltraBook 3.1\\.gemini\\antigravity-ide\\brain\\611f1266-50f5-4db9-8161-26d47edb32df\\.system_generated\\logs\\transcript_full.jsonl';
const outDir = 'C:\\EDUASSIST\\backend\\scratch\\exam_recovery';

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function recoverExamModule() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let stepCounter = 0;
  // Map of filePath -> array of edits
  const filesHistory = new Map();

  for await (const line of rl) {
    stepCounter++;
    if (!line.trim()) continue;
    
    let step;
    try {
      step = JSON.parse(line);
    } catch (e) {
      continue;
    }

    if (step.tool_calls) {
      for (const call of step.tool_calls) {
        let args = call.args || call.arguments;
        if (typeof args === 'string') {
             try { args = JSON.parse(args); } catch(e) {}
        }
        
        if (args && args.TargetFile) {
            const targetFile = args.TargetFile.replace(/\\\\/g, '\\').toLowerCase();
            
            // Loose check for "exam"
            if (targetFile.includes('exam')) {
                const actualPath = args.TargetFile.replace(/\\\\/g, '\\');
                if (!filesHistory.has(actualPath)) {
                    filesHistory.set(actualPath, []);
                }
                
                if (call.name === 'write_to_file' || call.name === 'default_api:write_to_file') {
                    filesHistory.get(actualPath).push({ step: stepCounter, type: 'write', content: args.CodeContent });
                }
                else if (call.name === 'replace_file_content' || call.name === 'default_api:replace_file_content') {
                    filesHistory.get(actualPath).push({ step: stepCounter, type: 'replace', args: args });
                }
                else if (call.name === 'multi_replace_file_content' || call.name === 'default_api:multi_replace_file_content') {
                    filesHistory.get(actualPath).push({ step: stepCounter, type: 'multi_replace', args: args });
                }
            }
        }
      }
    }
  }

  let recoveredCount = 0;
  let batchScript = '@echo off\n';
  
  for (const [filePath, edits] of filesHistory.entries()) {
      // Don't recover if it has 0 relevant edits
      if (edits.length === 0) continue;

      let currentContent = '';
      for (const edit of edits) {
          if (edit.step >= 4147) break; // Stop before regression
          
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
          // preserve a little structure in names to avoid collisions if they have the same basename
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

recoverExamModule().catch(console.error);
