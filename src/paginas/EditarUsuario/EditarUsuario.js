import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./EditarUsuario.module.css";
import { useEffect, useState } from "react";
import UsuarioAPI from "../../service/usuarioAPI";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
export function EditarUsuario(){
    const location = useLocation();
    const navigate = useNavigate();

    const [id] = useState(location.state);

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [TiposUsuarios, setTiposUsuarios] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isFormValid()){
            await UsuarioAPI.atualizarAsync(id, nome, email, tipoUsuario);
            navigate('/usuarios')
        } else {
            alert('Por favor, preencher todos os campos.')
        }
    }
    useEffect(() => {
        const buscarTiposUsuarios = async () => {
            try {
                const tipos = await UsuarioAPI.listarTiposUsuarioAsync();
                setTiposUsuarios(tipos);
            } catch (error) {
                console.error('Erro ao buscar tipos de usuarios:', error);
            }
        };

        const buscarDadosUsuario = async () => {
            try{
                const usurios = await UsuarioAPI.obterAsync(id);
                setTipoUsuario(usurios.tipoUsuario)
                setNome(usurios.nome)
                setEmail(usurios.email)
            } catch (error) {
                console.error('Erro ao buscar dados do usuario', error);
            }
        }


        buscarDadosUsuario();
        buscarTiposUsuarios();
    },[]);

    const isFormValid = () => {
        return nome && email && tipoUsuario;
    }
    return(
        <div className={style.conteudo}>
            <Sidebar>
                <Topbar>
                <div className={style.pagina_conteudo}>
                    <h3>EditarUsuario</h3>
                    <Form onSubmit={handleSubmit}>

                        <Form.Group controlId="formNome" className="mb-3">

                            <Form.Label>Nome</Form.Label>

                            <Form.Control
                                type="text"
                                placeholder="Digite seu nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />

                        </Form.Group>

                        <Form.Group controlId="formEmail" className="mb-3">

                            <Form.Label>Email</Form.Label>

                            <Form.Control
                                type="email"
                                placeholder="Digite seu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                        </Form.Group>

                        <Form.Group controlId="formTipoUsuario" className="mb-3">

                            <Form.Label>Tipo de Usuario</Form.Label>

                            <Form.Control
                                as="select"
                                name={tipoUsuario}
                                value={tipoUsuario}
                                onChange={(e) => setTipoUsuario(e.target.value)}
                                required
                                
                            >
                                
                                {TiposUsuarios.map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nome}
                                    </option>
                                ))}
                            </Form.Control>

                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={!isFormValid()}>
                            Salvar
                        </Button>
                           
                        

                    </Form>
                </div> 
                </Topbar> 
            </Sidebar>
        </div>
    )
}