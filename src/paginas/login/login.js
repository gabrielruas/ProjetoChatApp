import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./login.css";

export function Login() {
    const [nome, setNome] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const nomeAtendente = nome.trim();

        if (!nomeAtendente) {
            setErro("Informe seu nome para continuar.");
            return;
        }

        sessionStorage.setItem("nomeAtendente", nomeAtendente);
        navigate("/usuarios", { state: { nomeAtendente } });
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
                    <Button type="submit" className="w-100">Continuar</Button>
                </Form>
            </section>
        </main>
    );
}