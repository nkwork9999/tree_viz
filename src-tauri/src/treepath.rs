use serde::{Serialize,Deserialize};
use std::fs;
use std::path::Path;
use std::env;

#[derive(Serialize, Deserialize)]
struct DirNode{
    name:String,
    children:Vec<DirNode>,
}

pub fn build_tree(path:&Path) -> DirNode{
    let name = path.file_name().unwrap().to_string_lossy().into_owned();
    let children = if path.is_dir(){
        fs::read_dir(path).unwrap()
        .filter_map(|entry|entry.ok())
        .map(|entry| build_tree(&entry.path()))
        .collect()
    } else {
        vec![]
    };
    DirNode { name, children }
}
#[tauri::command]
pub fn tree1()-> Result<String, String>{
    //環境変数取得 match　二つのresult型を返す　Okならhomeへ
    let desktop_path = match env::var("HOME"){
        //Okなら homeにHOMEを取得
        // デスクトップのパスを生成
        //フォーマット文字列　文字列を作っている
        Ok(home) => format!("{}/Desktop",home),
        //環境変数がない
        Err(_) =>{
        //
            println!("Could not find the HOME environment variable.");
            return Err("Could not find the HOME environment variable.".to_string());
        }
    };
    let path = Path::new(&desktop_path);
    if path.exists(){
        let tree = build_tree(path);
        Ok(serde_json::to_string(&tree).unwrap())
    } else {
        Err("Desktop d nashi".to_string())
    }
}