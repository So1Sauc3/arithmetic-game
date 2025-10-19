"use client";

import AnimatedList from "@/components/AnimatedList";
import TextType from "@/components/TextType";
import { useEffect, useMemo, useRef, useState } from "react";
import StatisticsItem from "@/components/StatisticsItem";
import AbilityCard from "@/components/AbilityCard";
import { usePage } from "@/PageProvider";

type Ability = { id: string; name: string; image?: string };

export default function Game() {
    const [inputValue, setInputValue] = useState<string>("")
    const [timer, ___] = useState<number>(60);

    const { socket, question, score, coins, players } = usePage();
    // setDifficulty(question.difficulty)

    const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setInputValue(inputValue)
        if (inputValue !== "") {
            socket.sendSubmit(Number(inputValue));
        }
    };

    const [questionText, setQuestionText] = useState<string>("");
    useEffect(() => {
        setQuestionText(question.question);
        setInputValue("")
    }, [question]);

    // 10 abilities, keys QWERTYUIOP
    const keymap = "QWERTYUIOP".split("");
    const [abilities] = useState<Ability[]>(
        Array.from({ length: 10 }).map((_, i) => ({
            id: `a${i + 1}`,
            name: `Ability ${i + 1}`,
            image: undefined,
        })),
    );

    // costs assigned to each ability
    // FIXME: remove
    const abilityCosts = useMemo(
        () => abilities.map((_, i) => 1 + i * 2),
        [abilities],
    );

    const abilityRefs = useRef<Array<HTMLDivElement | null>>(
        Array(10).fill(null),
    );

    // attempt to buy & use an ability by index
    const attemptBuy = (index: number) => {
        const cost = abilityCosts[index] ?? 0;
        const el = abilityRefs.current[index];
        if (cost <= coins) {
            // success: deduct coins and apply effect
            // setCoin(c => c - cost);
            // setScore(s => s + 5 + index);
            if (el && typeof el.animate === "function") {
                el.animate(
                    [
                        { transform: "translateY(0)" },
                        { transform: "translateY(4px)" },
                        { transform: "translateY(0)" },
                    ],
                    { duration: 180, easing: "ease-in-out" },
                );
            }
        } else {
            // failure: shake
            if (el && typeof el.animate === "function") {
                el.animate(
                    [
                        { transform: "translateX(0)" },
                        { transform: "translateX(-6px)" },
                        { transform: "translateX(6px)" },
                        { transform: "translateX(0)" },
                    ],
                    { duration: 240, easing: "ease-in-out" },
                );
            }
        }
    };

    return (
        <div className="w-screen h-screen relative overflow-hidden text-white">
            <div className="w-[300px] h-screen left-0 top-0 absolute border-[#E8D8A1] border-2">
                <h3 className="text-lg font-semibold py-5">Scoreboard</h3>
                <AnimatedList
                    className="h-full"
                    items={Object.values(players).map((p) => p.name)}
                    itemClassName="cursor-pointer"
                    showGradients={true}
                    displayScrollbar={true}
                />
            </div>

            <div className="max-w-[900px] mx-auto flex justify-around text-2xl border p-3 border-[#E8D8A1]">
                <StatisticsItem name="score" value={score} />
                <StatisticsItem name="coins" value={coins} />
                <StatisticsItem name="difficulty" value={question.difficulty} />
                <StatisticsItem name="timer" value={timer} />
            </div>
            <div className="max-w-[800px] mx-auto h-full flex flex-col items-center justify-center">
                <div className="flex justify-center items-center w-full text-center mb-6 text-8xl">
                    <p className="pr-5">{questionText}</p>
                    <input
                        className="appearance-none firefox:textfield ml-1 bg-transparent border-none outline-none text-inherit w-auto inline-block max-w-[6ch]"
                        type="number"
                        autoFocus
                        value={inputValue}
                        onChange={inputHandler}
                    />
                    {/* <TextType */}
                    {/*     text={questionText} */}
                    {/*     typingSpeed={40} */}
                    {/*     initialDelay={100} */}
                    {/*     className="text-8xl font-bold" */}
                    {/*     handleInputChange={inputHandler} */}
                    {/* /> */}
                </div>
                {/* Input removed, user types directly in TextType */}
            </div>

            <div className="w-[300px] h-full right-0 top-0 absolute border-2 border-[#E8D8A1] bg-[#000A2233]">
                <div className="overflow-y-auto">
                    <h3 className="text-lg font-semibold py-5">Abilities</h3>

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
                </div>
            </div>
        </div>
    );
}
