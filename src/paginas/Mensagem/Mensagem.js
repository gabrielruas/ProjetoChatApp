import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
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
    const [mensagens, setMensagens] = useState([]);
    const [carregandoMensagens, setCarregandoMensagens] = useState(true);
    const [erroLista, setErroLista] = useState("");
    useEffect(() => {
        let ativo = true;

        const carregarMensagens = async () => {
            setCarregandoMensagens(true);
            setErroLista("");

            try {
                const resposta = await MensagemAPI.listarPorAtendimentoAsync(idAtendimento);
                const lista = Array.isArray(resposta)
                    ? resposta
                    : resposta?.mensagens ?? resposta?.Mensagens ?? resposta?.data ?? [];

                if (ativo) {
                    setMensagens(Array.isArray(lista) ? lista : []);
                }
            } catch (error) {
                console.error("Erro ao carregar mensagens:", error);
                if (ativo) {
                    setErroLista("Não foi possível carregar as mensagens deste atendimento.");
                }
            } finally {
                if (ativo) setCarregandoMensagens(false);
            }
        };

        carregarMensagens();
        return () => {
            ativo = false;
        };
    }, [idAtendimento]);

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
            setTexto("");
            try {
                const resposta = await MensagemAPI.listarPorAtendimentoAsync(idAtendimento);
                const lista = Array.isArray(resposta)
                    ? resposta
                    : resposta?.mensagens ?? resposta?.Mensagens ?? resposta?.data ?? [];
                setMensagens(Array.isArray(lista) ? lista : []);
                setErroLista("");
            } catch (error) {
                console.error("Mensagem enviada, mas não foi possível atualizar o histórico:", error);
                setErroLista("A mensagem foi enviada, mas não foi possível atualizar o histórico.");
            }
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
                    <section aria-label="Mensagens do atendimento" className="mb-4">
                        <h4>Histórico</h4>
                        {carregandoMensagens && <p>Carregando mensagens...</p>}
                        {erroLista && <p role="alert" className="text-danger">{erroLista}</p>}
                        {!carregandoMensagens && !erroLista && mensagens.length === 0 && (
                            <p>Ainda não há mensagens neste atendimento.</p>
                        )}
                        {mensagens.map((mensagem, index) => (
                            <article key={mensagem.id ?? mensagem.Id ?? index} className="mb-3">
                                <strong>{mensagem.remetente ?? mensagem.Remetente ?? ""}</strong>
                                <p>{mensagem.texto ?? mensagem.Texto ?? mensagem.mensagem ?? mensagem.Mensagem ?? ""}</p>
                            </article>
                        ))}
                    </section>
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