const fs = require('fs');
const readline = require('readline');
const path = require('path');

const transcriptPath = 'C:\\Users\\UltraBook 3.1\\.gemini\\antigravity-ide\\brain\\611f1266-50f5-4db9-8161-26d47edb32df\\.system_generated\\logs\\transcript_full.jsonl';

async function parseTranscript() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const filesState = new Map(); // path -> { content: string, lastUpdatedStep: number }
  let stepCounter = 0;
  let resetStep = -1;

  for await (const line of rl) {
    stepCounter++;
    if (!line.trim()) continue;
    
    let step;
    try {
      step = JSON.parse(line);
    } catch (e) {
      continue;
    }

    // Detect git reset --hard
    if (step.tool_calls) {
      for (const call of step.tool_calls) {
        if (call.name === 'default_api:run_command' && call.arguments && call.arguments.CommandLine) {
          if (call.arguments.CommandLine.includes('git reset --hard')) {
             resetStep = stepCounter;
          }
        }
      }
    }

    // Stop tracking file changes after the reset to avoid capturing the "recreated" empty models
    if (resetStep !== -1 && stepCounter > resetStep) {
       // Actually, we might want to know what was recreated, but we want the rich versions from before.
       // Let's just track everything, but keep a history per file.
    }

    if (step.tool_calls) {
      for (const call of step.tool_calls) {
        if (call.name === 'default_api:write_to_file' && call.arguments) {
           const target = call.arguments.TargetFile;
           if (target && !filesState.has(target)) {
               filesState.set(target, []);
           }
           if (target) {
               filesState.get(target).push({
                   step: stepCounter,
                   type: 'write',
                   content: call.arguments.CodeContent
               });
           }
        }
        else if (call.name === 'default_api:replace_file_content' && call.arguments) {
           const target = call.arguments.TargetFile;
           if (target && !filesState.has(target)) {
               filesState.set(target, []);
           }
           if (target) {
               filesState.get(target).push({
                   step: stepCounter,
                   type: 'replace',
                   args: call.arguments
               });
           }
        }
        else if (call.name === 'default_api:multi_replace_file_content' && call.arguments) {
           const target = call.arguments.TargetFile;
           if (target && !filesState.has(target)) {
               filesState.set(target, []);
           }
           if (target) {
               filesState.get(target).push({
                   step: stepCounter,
                   type: 'multi_replace',
                   args: call.arguments
               });
           }
        }
      }
    }
  }

  // Print out all files that were modified before the reset, and how many modifications they had
  console.log(`Git reset detected at step: ${resetStep}`);
  console.log("Files modified before reset:");
  
  for (const [filePath, history] of filesState.entries()) {
      const beforeReset = history.filter(h => h.step < resetStep);
      if (beforeReset.length > 0) {
          console.log(`- ${filePath} (${beforeReset.length} edits before reset)`);
      }
  }
}

parseTranscript().catch(console.error);
