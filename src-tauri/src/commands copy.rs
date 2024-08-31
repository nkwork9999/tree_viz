use std::env; //環境変数操作　env::var で環境変数の取得　::current_dir取得など
use std::fs; //fs ファイル操作 fs::read_to_string 読み書きとか　ディレクトリ作成とか
use std::path::Path; //path操作　親ディレクトリ取得 Path::parent
use serde::{Serialize,Deserialize};
#[derive(Serialize,Deserialize,Debug)]
struct DirNode{
    name:String,
    children: Vec<DirNode>,
}



#[tauri::command]
pub fn simple_command()->String{
    "String".to_string()
}

//errorを返すのがだめ
//Ok(())は返り血
#[tauri::command] //手続型マクロ
//ボイラープレートコード
//引数がJSONにシリアライズされ、Rustのバックエンドに送信されます。同様に、Rust関数の戻り値もJSONにシリアライズされ、JavaScriptのフロントエンドに送信されます。
//serde データ保存通信
//Result<T,E>列挙型　Ok(T)ならストリング Err(E)ならストリング
pub fn tree()-> Result<String, String>{
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
  //文字列スライス（&str）を受け取り、それをPathオブジェクトに変換
    //letの再代入は不可能
    let path = Path::new(&desktop_path);
    
    if path.exists(){
        //println!("{}",path.display());
        //visit_dirs(path,0);
        // match visit_dirs(path, 0) {
        //     Ok(output) => Ok(serde_json::to_string(&output).unwrap()),
        //     Err(e) => Err(format!("Error listing directory: {}", e)),
        // }
        match build_tree(path){
            Ok(output) => Ok(serde_json::to_string(&output).unwrap()),
            Err(e) => Err(format!("Error listning directory:{}",e)),
        }
    } else {
        Err("Desktop directory does not exist.".to_string())
    }
 
    }

    //Tauriコマンドはserde::ser::Serialize
    fn build_tree(dir: &Path) -> std::io::Result<DirNode>{
        let name = dir.file_name().unwrap().to_string_lossy().into_owned();
        let mut children = Vec::new();

        if dir.is_dir(){
            for entry in fs::read_dir(dir)?.filter_map(|entry|entry.ok()).take(2){
                // let entry = entry?;
                let path = entry.path();
                if path.is_dir(){
                    children.push(build_tree(&path)?);
                }
            }
        }
        Ok(DirNode{name,children})
    }
    // }
    // pub fn visit_dirs(dir: &Path, level: usize) -> std::io::Result<String>{
    //     let mut output = String::new();
    //     //これはディレクトリですか?
    //     if dir.is_dir(){
    //         // fs readでよむ
    //         //entry結果処理
    //         //path取得
    //         let mut entries = fs::read_dir(dir)?
    //             .filter_map(|entry| entry.ok())
    //             .take(2)
    //             .collect::<Vec<_>>();

    //             for entry in entries {
    //                 let path = entry.path();
    //                 for _ in 0..level {
    //                     output.push_str("  ");
    //                 }
          
    //             // displayで文字表示　ここで関数に渡している。
    //             // output.push_str(&format!("{}\n", path.display()));
    //             //println!("{}",path.display()); terminal ver
    //             if path.is_file(){
    //                 let file_name = path.file_name().unwrap().to_str().unwrap();
    //                 for _ in 0..level + 1{
    //                     output.push_str("  ");
    //                 }
    //                 output.push_str(&format!("{}\n",file_name));
    //             }
    //             if path.is_dir(){
    //                 let dir_name = path.file_name().unwrap().to_str().unwrap();
    //                 for _ in 0..level + 1{
    //                     output.push_str("  ");
    //                 }
    //                 output.push_str(&format!("{}\n",dir_name));
    //                 match visit_dirs(&path, level + 1) {
    //                     Ok(subdir_output) => output.push_str(&subdir_output),
    //                     Err(e) => return Err(e),
    //                 }
    //             }
    //         }
    //     }
    //     Ok(output)
    