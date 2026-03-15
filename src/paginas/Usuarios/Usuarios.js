import { Link } from "react-router-dom";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./Usuarios.module.css";
import { Table } from "react-bootstrap";
import { MdDelete, MdEdit } from "react-icons/md";
import { useEffect, useState } from "react";
import UsuarioAPI from "../../service/usuarioAPI";
export function Usuarios(){
    // const usuarios = [
    //     {
    //         id:1,
    //         nome: "Paulo Henrique",
    //         email: "paulo.henrique@hotmail.com"
    //     }
    // ]
    const [usuarios, setUsuarios] = useState([]);

    async function carregarUsuario() {
        try {
            const listaUsuarios = await UsuarioAPI.listarAsync(true);
            setUsuarios(listaUsuarios);
        } catch (error) {
            console.error("Erro ao carregar usuario:", error);
        }
    }
    
    useEffect(() => {
        carregarUsuario();
    }, []);
    return(
            <Sidebar>
                <Topbar>
                <div className={style.pagina_conteudo}>
                    <div className={style.pagina_cabecalho}>
                        <h3>Usuarios</h3>
                        <Link to='/usuarios/novo' className={style.botao_novo}> +Novo</Link>
                    </div>
                    <div className={style.tabela}>
                        <Table responsive>
                        <thead className={style.tabela_cabecalho}>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Acoes</th>
                            </tr>

                        </thead>
                        <tbody className={style.tabela_corpo} >
                            {usuarios.map((usuarios) => (
                                <tr key={usuarios.id}>
                                    <td> {usuarios.nome}</td>
                                    <td> {usuarios.email}</td>
                                    <td>
                                        <Link to='/usuario/editar' state={usuarios.id} className={style.botao_edit}>
                                            <MdEdit />
                                        </Link>
                                        <Link to='/usuario/deletar' state={usuarios.id} className={style.botao_delete}>
                                            <MdDelete />
                                        </Link>
                                    </td>

                                </tr>
                            ))}

                        </tbody>
                        </Table>

                    </div>
                   
                </div> 
                </Topbar> 
            </Sidebar>
    )
}