import { Link } from "react-router-dom";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./Usuarios.module.css";
import { Table } from "react-bootstrap";
import { MdDelete, MdEdit } from "react-icons/md";
import { useEffect, useState } from "react";
import UsuarioAPI from "../../service/usuarioAPI";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
export function Usuarios(){
   
    const [usuarios, setUsuarios] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

    const handleClickDeletar = (usuario) => {
        setUsuarioSelecionado(usuario);
        setMostrarModal(true);
    };
    const handleDeletar = async () => {
        try{
            await UsuarioAPI.deletarAsync(usuarioSelecionado.id);
            setUsuarios(usuarios.filter(u => u.id !== usuarioSelecionado.id));
        } catch (error) {
            console.error("Erro ao deletar usuario:",error);
        } finally {
            handleFecharModal()
        }
    }
    const handleFecharModal = () => {
        setMostrarModal(false);
        setUsuarioSelecionado(null);
    }



    async function carregarUsuarios() {
        try {
            const listaUsuarios = await UsuarioAPI.listarAsync(true);
            setUsuarios(listaUsuarios);
        } catch (error) {
            console.error("Erro ao carregar usuario:", error);
        }
    }
    
    useEffect(() => {
        carregarUsuarios();
    }, []);
    return(
            <Sidebar>
                <Topbar>
                <div className={style.pagina_conteudo}>
                    <div className={style.pagina_cabecalho}>
                        <h3>Usuarios</h3>
                        <Link to='/usuario/novo' className={style.botao_novo}> +Novo</Link>
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
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td> {usuario.nome}</td>
                                    <td> {usuario.email}</td>
                                    <td>
                                        <Link to='/usuario/editar' state={usuarios.id} className={style.botao_edit}>
                                            <MdEdit />
                                        </Link>
                                        <Button onClick={() => handleClickDeletar(usuario)} className={style.botao_delete}>
                                            <MdDelete />
                                        </Button>
                                    </td>

                                </tr>
                            ))}

                        </tbody>
                        </Table>

                    </div>
                    <Modal show={mostrarModal} onHide={handleFecharModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        Tem certeza que deseja deletar o usuário {usuarioSelecionado?.nome}?
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleFecharModal}>
                        Cancelar
                        </Button>

                        <Button variant="danger" onClick={handleDeletar}>
                        Deletar
                        </Button>
                    </Modal.Footer>
                    </Modal>
                   
                </div> 
                </Topbar> 
            </Sidebar>
    )
}