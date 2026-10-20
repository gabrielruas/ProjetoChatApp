import { useState } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import "./Mensagem.css";
import AtendimentoAPI from "../../service/atendimentoAPI";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export function Mensagem() {
    const [atendimentoID, setAtendimentoID] = useState("");
    const [remetente, setRemetente] = useState("");
    const [texto, setTexto] = useState("");
    
    const navigate = useNavigate();

    const isFormValid = () =>
        Boolean( assunto.trim());

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (enviando) return;
        if (!isFormValid()) {
            setErro("Preencha todos os campos antes de enviar.");
            return;
        }

        setEnviando(true);
        setErro("");

        try {
            await MensagemAPI.criarAsync(
                atendimentoID = 2,
                remetente ,
                texto
            );
            navigate("/usuarios");
        } catch (error) {
            console.error("Erro ao criar mensagem:", error);
            const resposta = error.response?.data;
            const errosValidacao = resposta?.errors
                ? Object.entries(resposta.errors)
                    .map(([campo, mensagens]) => `${campo}: ${mensagens.join(", ")}`)
                    .join("; ")
                : "";
            const detalhe =
                errosValidacao ||
                resposta?.message ||
                resposta?.title ||
                (resposta ? JSON.stringify(resposta) : error.message);
            const status = error.response?.status;
            setErro(
                `Não foi possível enviar o atendimento${status ? ` (HTTP ${status})` : ""}: ${detalhe}`
            );
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="conteudo">
            <Sidebar>
                <Topbar />
                <div className="pagina_conteudo">
                    <h3>Chat Atendimento</h3>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formNome" className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite seu nome"
                                value={nome}
                                onChange={(event) => setNome(event.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formEmail" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Digite seu email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formCelular" className="mb-3">
                            <Form.Label>Celular</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite seu celular"
                                value={celular}
                                onChange={(event) => setCelular(event.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formAssunto" className="mb-3">
                            <Form.Label>Assunto</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Descreva o assunto do atendimento"
                                value={assunto}
                                onChange={(event) => setAssunto(event.target.value)}
                                required
                            />
                        </Form.Group>

                        {erro && <p role="alert" className="text-danger">{erro}</p>}
                        <Button variant="primary" type="submit" disabled={enviando}>
                            {enviando ? "Enviando..." : "Salvar"}
                        </Button>
                    </Form>
                </div>
            </Sidebar>
        </div>
    );
}