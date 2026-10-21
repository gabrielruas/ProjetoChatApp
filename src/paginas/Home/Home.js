import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import Button from "react-bootstrap/Button";
import style from "./Home.module.css";
import { useNavigate } from "react-router-dom";
export function Home(){

    const navigate = useNavigate();
    function abrirLogin(){
        navigate("/login");
    }function abrirAtendimento(){
        navigate("/atendimento");
    }
    return(
        <div className={style.conteudo}>
            {/* <Sidebar>
                <Topbar> */}
                <div className={style.pagina_conteudo}>
                    <Button 
                        className={style.button_entrar}
                        onClick={abrirLogin}
                    >
                        Entrar
                    </Button>
                    <Button 
                        className={style.button_atendimento}
                        onClick={abrirAtendimento}
                    >
                        Atendimento
                    </Button>
                </div> 
                 
                {/* </Topbar> 
            </Sidebar> */}
        </div>
    )
}