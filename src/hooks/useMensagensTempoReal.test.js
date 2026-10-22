import { act, renderHook, waitFor } from "@testing-library/react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useMensagensTempoReal } from "./useMensagensTempoReal";

jest.mock("@microsoft/signalr", () => ({ HubConnectionBuilder: jest.fn() }));
jest.mock("../service/client", () => ({
    HTTPClient: { defaults: { baseURL: "http://localhost:5276" } }
}));

let conexoes;
beforeEach(() => {
    conexoes = [];
    HubConnectionBuilder.mockImplementation(() => {
        const conexao = {
            on: jest.fn(), off: jest.fn(),
            onreconnecting: jest.fn(), onreconnected: jest.fn(), onclose: jest.fn(),
            start: jest.fn().mockResolvedValue(),
            invoke: jest.fn().mockResolvedValue(),
            stop: jest.fn().mockResolvedValue()
        };
        conexoes.push(conexao);
        return {
            withUrl: jest.fn().mockReturnThis(),
            withAutomaticReconnect: jest.fn().mockReturnThis(),
            build: () => conexao
        };
    });
});

test("recebe somente o atendimento atual e retoma o grupo após reconexão", async () => {
    const atualizar = jest.fn();
    const { result, unmount } = renderHook(() => useMensagensTempoReal("6", atualizar));
    await waitFor(() => expect(result.current.status).toBe("conectado"));
    const conexao = conexoes[0];
    expect(conexao.invoke).toHaveBeenCalledWith("EntrarAtendimento", 6);
    const receber = conexao.on.mock.calls[0][1];
    act(() => {
        receber(7, [{ texto: "Outro atendimento" }]);
        receber(6, [{ texto: "Olá" }]);
    });
    expect(atualizar).toHaveBeenCalledTimes(1);
    expect(atualizar).toHaveBeenCalledWith([{ texto: "Olá" }]);
    await act(async () => { await conexao.onreconnected.mock.calls[0][0](); });
    expect(conexao.invoke).toHaveBeenCalledTimes(2);
    unmount();
    expect(conexao.stop).toHaveBeenCalled();
    receber(6, []);
    expect(atualizar).toHaveBeenCalledTimes(1);
});

test("encerra a conexão antiga ao trocar de atendimento", async () => {
    const { result, rerender } = renderHook(({ id }) => useMensagensTempoReal(id, jest.fn()), {
        initialProps: { id: "6" }
    });
    await waitFor(() => expect(result.current.status).toBe("conectado"));
    rerender({ id: "7" });
    await waitFor(() => expect(conexoes[1].invoke).toHaveBeenCalledWith("EntrarAtendimento", 7));
    expect(conexoes[0].stop).toHaveBeenCalled();
});

test("permite tentar novamente quando a conexão inicial falha", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useMensagensTempoReal("6", jest.fn()));
    // A rejeição ocorre antes de start terminar, no primeiro microtask.
    conexoes[0].invoke.mockRejectedValueOnce(new Error("Sem conexão"));
    await waitFor(() => expect(result.current.status).toBe("desconectado"));
    act(() => result.current.reconectar());
    await waitFor(() => expect(result.current.status).toBe("conectado"));
    expect(conexoes[0].stop).toHaveBeenCalled();
    expect(conexoes[1].start).toHaveBeenCalled();
    log.mockRestore();
});
