import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import MensagemAPI from "../../service/mensagemAPI";
import AtendimentoAPI from "../../service/atendimentoAPI";
import "./Mensagem.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const obterListaMensagens = (resposta) => {
    if (Array.isArray(resposta)) return resposta;
    return resposta?.mensagens ?? resposta?.Mensagens ?? resposta?.data ?? [];
};

const ordenarPorData = (lista) => [...lista].sort((a, b) => {
    const dataA = a.dataEnvio ?? a.DataEnvio ?? a.dataCriacao ?? a.DataCriacao ?? a.createdAt ?? a.CreatedAt;
    const dataB = b.dataEnvio ?? b.DataEnvio ?? b.dataCriacao ?? b.DataCriacao ?? b.createdAt ?? b.CreatedAt;
    if (!dataA || !dataB) return 0;
    return new Date(dataA).getTime() - new Date(dataB).getTime();
});

export function Mensagem() {
    const { idAtendimento } = useParams();
    const { state } = useLocation();
    const nomeCliente = state?.nomeCliente ?? "";
    const nomeAtendente = state?.nomeAtendente || sessionStorage.getItem("nomeAtendente") || "Atendente";
    const tipoRemetente = state?.tipoRemetente ?? "cliente";
    const remetente = tipoRemetente === "atendente" ? nomeAtendente : nomeCliente;
    const [texto, setTexto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagens, setMensagens] = useState([]);
    const [carregandoMensagens, setCarregandoMensagens] = useState(true);
    const [erroLista, setErroLista] = useState("");
    const [finalizando, setFinalizando] = useState(false);
    const [erroFinalizar, setErroFinalizar] = useState("");
    const [atendimentoFinalizado, setAtendimentoFinalizado] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        let ativo = true;

        const carregarMensagens = async () => {
            setCarregandoMensagens(true);
            setErroLista("");

            try {
                const resposta = await MensagemAPI.listarPorAtendimentoAsync(idAtendimento);
                const lista = obterListaMensagens(resposta);

                if (ativo) {
                    setMensagens(Array.isArray(lista) ? ordenarPorData(lista) : []);
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
                const lista = obterListaMensagens(resposta);
                setMensagens(Array.isArray(lista) ? ordenarPorData(lista) : []);
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

    const finalizarAtendimento = async () => {
        if (finalizando || atendimentoFinalizado) return;

        setFinalizando(true);
        setErroFinalizar("");
        try {
            await AtendimentoAPI.finalizarAsync(idAtendimento);
            setAtendimentoFinalizado(true);
            navigate("/gerenciamento", { state: { nomeAtendente } });
        } catch (error) {
            console.error("Erro ao finalizar atendimento:", error);
            const resposta = error.response?.data;
            const detalhe = resposta?.message || resposta?.title ||
                (resposta ? JSON.stringify(resposta) : error.message);
            setErroFinalizar(`Não foi possível finalizar o atendimento: ${detalhe}`);
        } finally {
            setFinalizando(false);
        }
    };

    return (
        <div className="conteudo">
            <Sidebar>
                <Topbar />
                <div className="pagina_conteudo">
                    <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                        <h3>Mensagem do atendimento #{idAtendimento}</h3>
                        {tipoRemetente === "atendente" && (
                            <Button
                                variant="success"
                                onClick={finalizarAtendimento}
                                disabled={finalizando || atendimentoFinalizado}
                            >
                                {finalizando ? "Finalizando..." : "Finalizar atendimento"}
                            </Button>
                        )}
                    </div>
                    {erroFinalizar && <p role="alert" className="text-danger">{erroFinalizar}</p>}
                    <section aria-label="Mensagens do atendimento" className="mb-4">
                        <h4>Histórico</h4>
                        {carregandoMensagens && <p>Carregando mensagens...</p>}
                        {erroLista && <p role="alert" className="text-danger">{erroLista}</p>}
                        {!carregandoMensagens && !erroLista && mensagens.length === 0 && (
                            <p>Ainda não há mensagens neste atendimento.</p>
                        )}
                        <div className="historico_mensagens">
                            {mensagens.map((mensagem, index) => {
                                const remetenteMensagem = mensagem.remetente ?? mensagem.Remetente ?? "";
                                const papel = (
                                    mensagem.tipoRemetente ??
                                    mensagem.TipoRemetente ??
                                    mensagem.autorTipo ??
                                    mensagem.AutorTipo ??
                                    ""
                                ).toString().toLocaleLowerCase();
                                const ehCliente = papel
                                    ? papel.includes("cliente") || papel.includes("usuario") || papel.includes("usuário")
                                    : remetenteMensagem.trim().toLocaleLowerCase() === nomeCliente.trim().toLocaleLowerCase();
                                return (
                                    <article
                                        key={mensagem.idMensagem ?? mensagem.IdMensagem ?? mensagem.id ?? mensagem.Id ?? index}
                                        className={`mensagem_bolha ${ehCliente ? "mensagem_cliente" : "mensagem_atendente"}`}
                                    >
                                        <strong>{remetenteMensagem || (ehCliente ? nomeCliente : "Atendente")}</strong>
                                        <p>{mensagem.texto ?? mensagem.Texto ?? mensagem.mensagem ?? mensagem.Mensagem ?? ""}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formRemetente" className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={tipoRemetente === "atendente" ? nomeAtendente : "Nome informado no atendimento"}
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