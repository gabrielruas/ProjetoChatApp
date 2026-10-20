import { useEffect, useState } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import "./Atendimento.css";
import UsuarioAPI from "../../service/usuarioAPI";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export function Atendimento() {

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [TiposUsuarios, setTiposUsuarios] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {

        const fetchTiposUsuarios = async () => {
            try {
                const tipos = await UsuarioAPI.listarTiposUsuarioAsync();
                setTiposUsuarios(tipos);
            } catch (error) {
                console.error('Erro ao buscar tipos de usuario:', error);
            }
        };
    
        fetchTiposUsuarios();
    
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (isFormValid()) {
            try {
    
                await UsuarioAPI.criarAsync(nome, email, senha, tipoUsuario);
    
                navigate('/usuarios');
    
            } catch (error) {
                console.error("Erro ao criar usuário:", error);
            }
    
        } else {
            alert('Por favor, preencha todos os campos');
        }
    };

    const isFormValid = () => {
        return nome && email && senha && tipoUsuario;
    };

    return (
        <div className="conteudo">

            <Sidebar>

                <Topbar />

                <div className="pagina_conteudo">

                    <h3>Novo Atendimento</h3>

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

                        <Form.Group controlId="formSenha" className="mb-3">

                            <Form.Label>Senha</Form.Label>

                            <Form.Control
                                type="password"
                                placeholder="********"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
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
                                <option value=""> Select o tipo de usuario </option>
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

            </Sidebar>

        </div>
    );
}