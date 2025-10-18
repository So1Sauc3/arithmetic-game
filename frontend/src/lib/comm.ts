

export const RegisterOp = 0 as const;
export const SubmitOp = 1 as const;
export const PurchaseOp = 2 as const;

export type RegisterMessage = {
    opcode: typeof RegisterOp;
    name: string
}

export type SubmitMessage = {
    opcode: typeof SubmitOp;
    answer: number
}

export type PurchaseMessage = {
    opcode: typeof PurchaseOp;
    powerup: number
    targetId: number
}

export type ClientMessage = RegisterMessage | SubmitMessage | PurchaseMessage;

export const HubHelloOp = 0 as const;
export const LobbyHelloOp = 1 as const;
export const NewPlayerOp = 2 as const;
export const CorrectSubmissionOp = 3 as const;
export const NewQuestionOp = 4 as const;
export const PurchaseConfirmedOp = 5 as const;
export const StatusChangedOp = 6 as const;
export const OpponentStatusChangedOp = 7 as const;
export const EliminatedOp = 8 as const;
export const StartGameOp = 9 as const;

export type Player = {
    id: number
    name: string
}

export type Status = number;

export type HubHello = {
    opcode: typeof HubHelloOp;
}

export type LobbyHello = {
    opcode: typeof LobbyHelloOp;
    players: Player[]
};

export type NewPlayer = {
    opcode: typeof NewPlayerOp;
} & Player;

export type CorrectSubmission = {
    opcode: typeof CorrectSubmissionOp
    score: number
    coins: number
}

export type NewQuestion = {
    opcode: typeof NewQuestionOp
    question: string
}

export type PurchaseConfirmed = {
    opcode: typeof PurchaseConfirmedOp
    coins: number
}

export type StatusChanged = {
    opcode: typeof StatusChangedOp
    effects: Status[]
}

export type OpponentStatusChanged = {
    opcode: typeof OpponentStatusChangedOp
    playerId: number
    effects: Status[]
}

export type Eliminated = {
    opcode: typeof EliminatedOp
    place: number
}

export type StartGame = {
    opcode: typeof StartGameOp
}

export type ServerMessage = HubHello | LobbyHello | NewPlayer | CorrectSubmission | NewQuestion | PurchaseConfirmed | StatusChanged | OpponentStatusChanged | Eliminated | StartGame;

const textDecoder = new TextDecoder('utf-8');
const textEncoder = new TextEncoder();

function serializeClientMessage(payload: ClientMessage): ArrayBuffer {
    let buffer, view;
    const { opcode } = payload;
    switch (opcode) {
        case 0: // Register
            // payload: { opcode: 0, name: string }
            const nameEncoded = textEncoder.encode(payload.name);
            if (nameEncoded.length > 255) throw new Error("Name too long");
            buffer = new ArrayBuffer(1 + 1 + nameEncoded.length); // opcode + nameLen + name
            view = new DataView(buffer);
            view.setUint8(0, opcode);
            view.setUint8(1, nameEncoded.length);
            for (let i = 0; i < nameEncoded.length; i++) {
                view.setUint8(2 + i, nameEncoded[i]);
            }
            return buffer;

        case 1: // Submission
            // payload: { opcode: 1, answer: number }
            buffer = new ArrayBuffer(1 + 4); // opcode + answer
            view = new DataView(buffer);
            view.setUint8(0, opcode);
            view.setInt32(1, payload.answer, false); // big endian
            return buffer;

        case 2: // Powerup purchase
            // payload: { opcode: 2, powerupId: number, affectedPlayerId: number }
            buffer = new ArrayBuffer(1 + 1 + 1); // opcode + powerupId + affectedPlayerId
            view = new DataView(buffer);
            view.setUint8(0, opcode);
            view.setUint8(1, payload.powerup);
            view.setUint8(2, payload.targetId);
            return buffer;

        default:
            throw new Error("Unknown opcode: " + opcode);
    }
}

// Helper: parses a player from a DataView at the given offset
function parsePlayer(view: DataView, offset: number): [Player, number] {
    const playerId = view.getUint8(offset++);
    const nameLen = view.getUint8(offset++);
    const nameBytes = new Uint8Array(view.buffer, view.byteOffset + offset, nameLen);
    const name = textDecoder.decode(nameBytes);
    offset += nameLen;
    return [{ id: playerId, name }, offset];
}

// Helper: parses status effect IDs
function parseStatusEffects(view: DataView, count: number, offset: number): [Status[], number] {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push(view.getUint16(offset, false)); // big-endian
        offset += 2;
    }
    return [arr, offset];
}

function parseServerMessage(buffer: ArrayBuffer): ServerMessage {
    const view = new DataView(buffer);
    let offset = 0;

    const opcode = view.getUint8(offset++);

    switch (opcode) {
        case 0: // Hub Greeting
            // No content
            return { opcode } ;

        case 1: // Lobby Greeting
            {
                const numPlayers = view.getUint8(offset++);
                const players = [];
                for (let i = 0; i < numPlayers; i++) {
                    let parsed;
                    [parsed, offset] = parsePlayer(view, offset);
                    players.push(parsed);
                }
                return { players, opcode };
            }

        case 2: // New Registered Player
            {
                let player;
                [player, offset] = parsePlayer(view, offset);
                return { ...player, opcode };
            }

        case 3: // Correct Submission
            {
                const score = view.getUint32(offset, false); // big-endian
                offset += 4;
                const coins = view.getUint32(offset, false); // big-endian
                offset += 4;
                return { score, coins, opcode };
            }

        case 4: // New Question
            {
                const questionLength = view.getUint16(offset, false); // big-endian
                offset += 2;
                const qBytes = new Uint8Array(view.buffer, view.byteOffset + offset, questionLength);
                const question = textDecoder.decode(qBytes);
                offset += questionLength;
                return { question, opcode };
            }

        case 5: // Purchase Confirmed
            {
                const coins = view.getUint32(offset, false); // big-endian
                offset += 4;
                return { coins, opcode };
            }

        case 6: // Status Changed
            {
                const effectCount = view.getUint16(offset, false); // big-endian
                offset += 2;
                let effects;
                [effects, offset] = parseStatusEffects(view, effectCount, offset);
                return { effects, opcode };
            }

        case 7: // Other Player Status Changed
            {
                const playerId = view.getUint8(offset++);
                const effectCount = view.getUint16(offset, false); // big-endian
                offset += 2;
                let effects;
                [effects, offset] = parseStatusEffects(view, effectCount, offset);
                return { playerId, effects, opcode };
            }

        case 8: // Eliminated
            {
                const place = view.getUint8(offset++);
                return { place, opcode };
            }

        case 9: // Start Game
            // No content
            return { opcode } ;

        default:
            throw new Error('Unknown opcode: ' + opcode);
    }
}

/*
// Example usage:
ws.onmessage = function(e) {
    const msg = parseServerMessage(e.data); // e.data is ArrayBuffer
    console.log(msg);
    // ... process msg
};
*/

export type Socket = {
    socket: WebSocket
    onMessage: (arg0: (arg0: ServerMessage) => void) => void
    send: (arg0: ClientMessage) => void
}

export async function connect(url: string, name: string) {
    const socket = new WebSocket(url + "?name=" + name);
    socket.binaryType = "arraybuffer";

    socket.addEventListener("message", (event) => {
        console.log(parseServerMessage(event.data));
    });

    return {
        socket,
        onMessage: (handler: (arg0: ServerMessage) => void) => {
            socket.addEventListener("message", (event: MessageEvent<any>) => handler(parseServerMessage(event.data)))
        },
        send: (message: ClientMessage) => {
            socket.send(serializeClientMessage(message))
        },
    };
}
