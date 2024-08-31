// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
//Rustの条件付きコンパイル属性（cfg_attr）configuration attribute条件に基づき属性
//debug_assertions　デバックの時につく notでリリース状態の時に真になる　cargo build --release
//windows_subsystem　ウインドウが出るのを防ぐ
mod commands;
use commands::{simple_command,tree,open_directory};
use tauri::Builder;
fn main(){
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            simple_command,
            open_directory,
            tree,
         
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
        }
