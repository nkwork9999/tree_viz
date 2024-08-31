use std::process::Command;
use std::str;
use tauri::command;
use serde::Serialize;
use serde_json::Value;
#[derive(Serialize)]
struct TreeNode {
    id: String,
    label: String,
    children: Vec<TreeNode>,
}

#[tauri::command]
pub fn tree2() -> Result<String, String> {
    let output = Command::new("tree")
    .arg("-J")
    .arg("-L")
    .arg("2") // 深度を2に制限
    .arg(".")
    .output()
        .map_err(|e| format!("Failed to execute tree command: {}", e))?;

    let stdout = str::from_utf8(&output.stdout)
        .map_err(|e| format!("Failed to parse command output: {}", e))?;

    // JSONをパースして最初の10件のみを取得
    let mut json: Value = serde_json::from_str(stdout)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    if let Some(array) = json.as_array_mut() {
        array.truncate(10);
    }

    Ok(json.to_string())
}

