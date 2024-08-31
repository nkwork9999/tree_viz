use std::env; //環境変数操作　env::var で環境変数の取得　::current_dir取得など
use std::fs; //fs ファイル操作 fs::read_to_string 読み書きとか　ディレクトリ作成とか
use std::path::Path; //path操作　親ディレクトリ取得 Path::parent
use serde::{Serialize,Deserialize};
use std::time::{SystemTime, UNIX_EPOCH};
use std::process::Command;


#[derive(Serialize,Deserialize,Debug)] // name UTF-8 文字列
struct DirNode{
    name:String,
    path:String,
    last_modified:u64,
    children: Vec<DirNode>,             //可変長Vector DirNode インスタンス
}



#[tauri::command]
pub fn simple_command() -> String {
    "Simple command executed!".to_string()
}

#[tauri::command]
pub fn open_directory(path:String) -> Result<(),String>{
    Command::new("open")
        .arg(path)
        .spawn()
        .map_err(|e| format!("faild{}",e))?;
    Ok(())
}

#[tauri::command] //ボイラープレートコード

//serde JSONシリアライズ　フロントエンドへ
//Result<T,E>列挙型　Ok(T)ならストリング Err(E)ならストリング
pub fn tree()-> Result<String, String>{
    
    let desktop_path = match env::var("HOME"){
        //Okなら desktop_pathにHOME環境変数を取得　して格納

        Ok(home) => format!("{}/Desktop",home),

        //環境変数がない
        Err(_) =>{
        //
            println!("Could not find the HOME environment variable.");
            return Err("Could not find the HOME environment variable.".to_string());
        }
    };
  //文字列スライス（&str）を受け取り、それをPathオブジェクトに変換 std::path::Pathに変換可能
    //letの再代入は不可能
    let path = Path::new(&desktop_path);
    
    if path.exists(){
        //println!("{}",path.display());
        //visit_dirs(path,0);
        // match visit_dirs(path, 0) {
        //     Ok(output) => Ok(serde_json::to_string(&output).unwrap()),
        //     Err(e) => Err(format!("Error listing directory: {}", e)),
        // }
        
        //build_treeが成功ならOk
        match build_tree(path){
            //outputに関数の実行結果が出てくる
            //output は=>がいる？
            Ok(output) => Ok(serde_json::to_string(&output).unwrap()),  //unwrap 文字列を解除　パニックとなるのでmatchで使用
            Err(e) => Err(format!("Error listning directory:{}",e)),
            
            //ベクターはデバック出力の{:?}
            
        }
    } else {
        Err("Desktop directory does not exist.".to_string())
    }
 
    }

    //Tauriコマンドはserde::ser::Serialize 戻り値
    fn build_tree(dir: &Path) -> std::io::Result<DirNode>{
        //to_string_lossy 非UTF-8でも　OSStr Cow<Str>
        //into_owned　所有権を付与　かつ　stringへ
        let name = dir.file_name().unwrap().to_string_lossy().into_owned();
        let path = dir.to_string_lossy().into_owned();
        let metadata = fs::metadata(dir)?;
        // let metadata = fs::metadata(dir).map_err(|e| format!("Failed to get metadata: {}", e))?;
        let last_modified = metadata.modified()?
            // .map_err(|e| format!("Failed to get modification time: {}", e))?
            .duration_since(UNIX_EPOCH)
            // .map_err(|e| format!("Failed to calculate duration: {}", e))?
            .unwrap()
            .as_millis() as u64;
        let mut children = Vec::new();

        if dir.is_dir(){
            // fs::read_dir でディレクトリ内検索してリストに格納
            //filter_mapイテレーターメソッド　Some None
            //take は3番目のディスプレイを取得している
            for entry in fs::read_dir(dir)?.filter_map(|entry|entry.ok()).take(12){
                // let entry = entry?;
                //std::path::PathBufは、所有権のあるパス型で、可変であり、ファイルシステムパスの操作に使用されます。Path型とは異なり、PathBufは可変
                
                //entryからpathを抜く
                let path = entry.path();
                //path がディレクトリとファイルパス
                
                if path.is_dir(){
                    //pathがディレクトリならchildrenにディレクトリのパスを入れている ファイル名はなし
                    children.push(build_tree(&path)?);
                   
                }
                //name はフォルダ名
               
            }
        }
        Ok(DirNode{name,path,last_modified,children})
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
    