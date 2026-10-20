import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import MensagemAPI from "../../service/mensagemAPI";
import "./Mensagem.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export function Mensagem() {
    const { idAtendimento } = useParams();
    const { state } = useLocation();
    const nomeCliente = state?.nomeCliente ?? "";
    const [remetente] = useState(nomeCliente);
    const [texto, setTexto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (enviando) return;

        if (!remetente.trim() || !texto.trim()) {
            setErro("O nome do atendimento não foi recebido ou a mensagem está vazia. Volte e tente novamente.");
            return;
        }

        setEnviando(true);
        setErro("");

        try {
            await MensagemAPI.criarAsync(idAtendimento, remetente.trim(), texto.trim());
            navigate("/usuarios");
        } catch (error) {
            console.error("Erro ao criar mensagem:", error);
            const resposta = error.response?.data;
            const errosValidacao = resposta?.errors
                ? Object.entries(resposta.errors)
                    .map(([campo, mensagens]) => `${campo}: ${mensagens.join(", ")}`)
                    .join("; ")
                : "";
            const detalhe = errosValidacao || resposta?.message || resposta?.title ||
                (resposta ? JSON.stringify(resposta) : error.message);
            setErro(`Não foi possível enviar a mensagem: ${detalhe}`);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="conteudo">
            <Sidebar>
                <Topbar />
                <div className="pagina_conteudo">
                    <h3>Mensagem do atendimento #{idAtendimento}</h3>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formRemetente" className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nome informado no atendimento"
                                value={remetente}
                                readOnly
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formTexto" className="mb-3">
                            <Form.Label>Mensagem</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Digite sua mensagem"
                                value={texto}
                                onChange={(event) => setTexto(event.target.value)}
                                required
                            />
                        </Form.Group>

                        {erro && <p role="alert" className="text-danger">{erro}</p>}
                        <Button variant="primary" type="submit" disabled={enviando}>
                            {enviando ? "Enviando..." : "Enviar mensagem"}
                        </Button>
                    </Form>
                </div>
            </Sidebar>
        </div>
    );
}