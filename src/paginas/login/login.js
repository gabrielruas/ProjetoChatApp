import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import UsuarioAPI from "../../service/usuarioAPI";
import "./login.css";

export function Login() {
    const [nome, setNome] = useState("");
    const [erro, setErro] = useState("");
    const [validando, setValidando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nomeAtendente = nome.trim();

        if (!nomeAtendente) {
            setErro("Informe seu nome para continuar.");
            return;
        }

        setValidando(true);
        setErro("");

        try {
            const resposta = await UsuarioAPI.listarAsync(true);
            const usuarios = Array.isArray(resposta)
                ? resposta
                : resposta?.usuarios ?? resposta?.Usuarios ?? resposta?.data ?? [];
            const usuarioEncontrado = usuarios.find((usuario) => {
                const nomeUsuario = usuario.nome ?? usuario.Nome ?? "";
                return nomeUsuario.trim().toLocaleLowerCase() === nomeAtendente.toLocaleLowerCase();
            });

            if (!usuarioEncontrado) {
                setErro("Usuário não encontrado ou inativo. Confira o nome e tente novamente.");
                return;
            }

            const nomeValidado = usuarioEncontrado.nome ?? usuarioEncontrado.Nome;
            sessionStorage.setItem("nomeAtendente", nomeValidado);
            navigate("/usuarios", { state: { nomeAtendente: nomeValidado } });
        } catch (error) {
            console.error("Erro ao validar usuário:", error);
            setErro("Não foi possível validar o usuário. Verifique se a API está disponível e tente novamente.");
        } finally {
            setValidando(false);
        }
    };

    return (
        <main className="login_conteudo">
            <section className="login_card">
                <h1>Entrar</h1>
                <p>Informe seu nome para acessar a área de atendimento.</p>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="nomeAtendente" className="mb-3">
                        <Form.Label>Nome do atendente</Form.Label>
                        <Form.Control
                            type="text"
                            autoComplete="name"
                            placeholder="Digite seu nome"
                            value={nome}
                            onChange={(event) => setNome(event.target.value)}
                            required
                        />
                    </Form.Group>
                    {erro && <p role="alert" className="text-danger">{erro}</p>}
                    <Button type="submit" className="w-100" disabled={validando}>
                        {validando ? "Validando..." : "Continuar"}
                    </Button>
                </Form>
            </section>
        </main>
    );
}