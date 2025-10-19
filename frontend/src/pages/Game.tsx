"use client";

import AnimatedList from "@/components/AnimatedList";
import TextType from "@/components/TextType";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StatisticsItem from "@/components/StatisticsItem";
import AbilityCard from "@/components/AbilityCard";
import Plate from "@/components/Plate";

type Ability = { id: string; name: string; image?: string };

function generateEquation() {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const op = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    const expr = `${a} ${op} ${b} = `;
    // eslint-disable-next-line no-eval
    // safe-ish for small ints
    const answer = 0;
    return { expr, answer } as { expr: string; answer: number };
}

export default function Game() {
    const [equation, setEquation] = useState<string>("0 + 0");
    const [answer, setAnswer] = useState<number>(0);
    const [inputValue, setInputValue] = useState<string>("");
    // Track focus for TextType input
    const [isInputActive, setIsInputActive] = useState<boolean>(true);
    const [score, setScore] = useState<number>(0);
    const [coin, setCoin] = useState<number>(0);
        const [difficulty, setDifficulty] = useState<number>(1);
    const [timer, setTimer] = useState<number>(60);

        // 10 abilities, keys QWERTYUIOP
        const keymap = 'QWERTYUIOP'.split('');
        const [abilities] = useState<Ability[]>(
            Array.from({ length: 10 }).map((_, i) => ({ id: `a${i + 1}`, name: `Ability ${i + 1}`, image: undefined }))
        );

        // costs assigned to each ability
        const abilityCosts = useMemo(() => abilities.map((_, i) => 1 + i * 2), [abilities]);

        const abilityRefs = useRef<Array<HTMLDivElement | null>>(Array(10).fill(null));
        const inputWrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const { expr, answer } = generateEquation();
        setEquation(expr);
        setAnswer(answer);
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            setTimer(t => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const submit = useCallback(() => {
        if (inputValue.trim() === "") return;
        const val = Number(inputValue.trim());
        if (!Number.isFinite(val)) return;

        // animate input wrapper for feedback (down and up)
        if (inputWrapperRef.current && typeof inputWrapperRef.current.animate === 'function') {
            inputWrapperRef.current.animate([
                { transform: 'translateY(0)' },
                { transform: 'translateY(4px)' },
                { transform: 'translateY(0)' }
            ], { duration: 180, easing: 'ease-in-out' });
        }

        if (Math.abs(val - answer) < 0.0001) {
            setScore(s => s + 10 * difficulty);
            setCoin(c => c + 1);
            // new equation
            const { expr, answer: a } = generateEquation();
            setEquation(expr);
            setAnswer(a);
        } else {
            // penalize
            setScore(s => Math.max(0, s - 2));
        }

        // clear input regardless of correctness
        setInputValue("");
    }, [inputValue, answer, difficulty]);

    // Listen for key events and update inputValue (only numbers)
    useEffect(() => {
        if (!isInputActive) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submit();
                return;
            }
            if (e.key === 'Backspace') {
                setInputValue((v) => v.slice(0, -1));
                return;
            }
            if (/^[0-9]$/.test(e.key)) {
                setInputValue((v) => v.length < 6 ? v + e.key : v); // max 6 digits
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isInputActive, submit]);

        useEffect(() => {
            // bump difficulty every 100 points
            setDifficulty(Math.max(1, Math.floor(score / 100) + 1));
        }, [score]);

    // No longer needed: onKeyDown for Input

    const scoreboardItems = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => `Player ${i + 1} — ${Math.max(0, 100 - i * 3)}`);
    }, []);

    // attempt to buy & use an ability by index
    const attemptBuy = (index: number) => {
        const cost = abilityCosts[index] ?? 0;
        const el = abilityRefs.current[index];
        if (coin >= cost) {
            // success: deduct coins and apply effect
            setCoin(c => c - cost);
            setScore(s => s + 5 + index);
            if (el && typeof el.animate === 'function') {
                el.animate([
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(4px)' },
                    { transform: 'translateY(0)' }
                ], { duration: 180, easing: 'ease-in-out' });
            }
        } else {
            // failure: shake
            if (el && typeof el.animate === 'function') {
                el.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-6px)' },
                    { transform: 'translateX(6px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 240, easing: 'ease-in-out' });
            }
        }
    };

    useEffect(() => {
        const handle = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            const idx = keymap.indexOf(key);
            if (idx >= 0) {
                e.preventDefault();
                attemptBuy(idx);
            }
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [abilityCosts, coin, keymap]);

    return (
        // <Plate className="" pathDataTemplate="M 0 0 H width V height H 0 Z">

        // </Plate>
        <div className="w-screen h-screen relative overflow-hidden text-white">
            <div className="w-[300px] h-screen left-0 top-0 absolute border-[#E8D8A1] border-2">
                <h3 className="text-lg font-semibold py-5">Scoreboard</h3>
                <AnimatedList
                    className="h-full"
                    items={scoreboardItems}
                    itemClassName="cursor-pointer"
                    showGradients={true}
                    displayScrollbar={true}
                />
            </div>

            <div className="max-w-[900px] mx-auto flex justify-around text-2xl border p-3 border-[#E8D8A1]">
                <StatisticsItem name="score" value={score} />
                <StatisticsItem name="coins" value={coin} />
                <StatisticsItem name="difficulty" value={difficulty} />
                <StatisticsItem name="timer" value={timer} />
            </div>
            <div className="max-w-[800px] mx-auto h-full flex flex-col items-center justify-center">
                <div className="w-full text-center mb-6">
                    <TextType
                        text={equation}
                        typingSpeed={40}
                        initialDelay={100}
                        className="text-8xl font-bold"
                        userInput={inputValue}
                        isInputActive={isInputActive}
                        setIsInputActive={setIsInputActive}
                    />
                </div>
                {/* Input removed, user types directly in TextType */}
            </div>

            <div className="w-[300px] h-full right-0 top-0 absolute border-2 border-[#E8D8A1] bg-[#000A2233]">

                <Plate className="absolute left-0 right-0 p-2 overflow-y-auto" pathDataTemplate="M 0 0 H width V height H 0 Z">
                    <h4 className="text-md text-slate-300 mb-2">Abilities</h4>

                    <div className="space-y-2">
                        {abilities.map((a, i) => (
                            <AbilityCard
                                key={a.id}
                                ref={(el) => {
                                    abilityRefs.current[i] = el;
                                }}
                                name={a.name}
                                image={a.image}
                                cost={abilityCosts[i]}
                                keybind={keymap[i]}
                                onClick={() => attemptBuy(i)}
                            />
                        ))}
                    </div>
                </Plate>
            </div>
        </div>
    );
}
