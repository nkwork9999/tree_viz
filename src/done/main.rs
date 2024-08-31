#[tauri::command]
fn simple_command(){
    println!("iwanna");
}

fn keyinput(
    state:tauri::State<'_,GameManager>,
    key: char)->GameField{
    let mut x_pos = state.get_xpos();
    state.set_xpos(x_pos);
}

impl GameManager{
    pub fn get_xpos(&self) ->i32{
        let param = self.update_param.lock().unwrap();
        param.x_pos
    }
    pub fn set_xpos(&self,x_pos:i32){
        let mut param = self.update_param.lock().unwrap();
        param.x_pos=x_pos;
    }
}
fn main(){
    tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![simple_command])
    .invoke_handler(tauri::generate_handler![
        keyinput
        get_gamefield,
        update_gamefield,
        ])
    .setup(|app|{
        let gamemanager = GameManager::new();
        app.manage(gamemanager);
        Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error");
}
//10個のi32型の配列を20個持つ
pub struct GameField{
    field:[[i32;10];20],
}

pub struct GameManager{
    field:Mutex<GameField>,
    block:Mutex<FallinBlock>,
}


fn command_with_message(message:String)->String{
    format!("hello{}",message)
}