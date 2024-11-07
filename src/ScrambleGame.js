import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ScrambleGame.css';

const ScrambleGame = ({ attempts = 3, skips = 2, wordsList = [] }) => {
    const defaultWords = wordsList.length ? wordsList : ["toronto", "vancouver", "montreal", "calgary", "ottawa", "edmonton", "winnipeg", "quebec", "hamilton", "victoria"];

    const [words, setWords] = useState(defaultWords);
    const [currentWord, setCurrentWord] = useState('');
    const [scrambledWord, setScrambledWord] = useState('');
    const [inputWord, setInputWord] = useState('');
    const [points, setPoints] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [pass, setPass] = useState(skips);
    const [isGameOver, setIsGameOver] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (status) {
            const timeout = setTimeout(() => {
                setStatus('');
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [status]);

    function shuffle(src) {
        const isString = typeof src === 'string';
        const copy = isString ? src.split('') : [...src];  
        const length = copy.length;
        for (let i = 0; i < length; i++) {
            const x = copy[i];
            const y = Math.floor(Math.random() * length);
            const z = copy[y];
            copy[i] = z;
            copy[y] = x;
        }
        return isString ? copy.join('') : copy;  
    }

    const playGame = () => {
     
        localStorage.removeItem('scrambleGame');

       
        setWords(defaultWords);
        setCurrentWord('');
        setScrambledWord('');
        setInputWord('');
        setPoints(0);
        setStrikes(0);
        setPass(skips);
        setStatus('');
        setIsGameOver(false);

      
        const firstWord = defaultWords[0]; 
        setCurrentWord(firstWord); 
        setScrambledWord(shuffle(firstWord)); 
        storeProgress(defaultWords, firstWord, 0, 0, skips, false);
    };

    const submitGuess = (e) => {
        e.preventDefault();
        if (inputWord.trim() === '') {
            setStatus('Please enter a guess.');
            return;
        }
        if (inputWord.toLowerCase() === currentWord) {
            setPoints(points + 1);
            setStatus('Correct!');
            nextWord(points + 1);
        } else {
            const updatedStrikes = strikes + 1;
            setStrikes(updatedStrikes);
            setStatus('Incorrect!');
            storeProgress(words, currentWord, points, updatedStrikes, pass, isGameOver);
            if (updatedStrikes >= attempts) {
                setIsGameOver(true);
                storeProgress(words, currentWord, points, updatedStrikes, pass, true);
            }
        }
        setInputWord('');
    };



    const Pass = () => {
        if (pass > 0) {
            const newPass = pass - 1;  
            setPass(newPass);         
            nextWord(points);          
            setStatus('Skipped!');
            storeProgress(words, currentWord, points, strikes, newPass, isGameOver); 
        } else {
            setStatus('No skips left.');  
        }
    };
    
    useEffect(() => {
        const savedGame = JSON.parse(localStorage.getItem('scrambleGame'));
        if (savedGame) {
            const { words, currentWord, points, strikes, passes, isOver } = savedGame;
            setWords(words);
            setCurrentWord(currentWord);
            setScrambledWord(shuffle(currentWord));
            setPoints(points);
            setStrikes(strikes);
            setPass(passes); 
            setIsGameOver(isOver);
            setStatus(isOver ? `Game Over! Your points: ${points}` : '');
        } else {
            playGame(); 
        }
    }, []);

    const storeProgress = (words, currentWord, points, strikes, passes, isOver) => {
        try {
            const gameData = { words, currentWord, points, strikes, passes, isOver };
            localStorage.setItem('scrambleGame', JSON.stringify(gameData));
        } catch (error) {
            console.error("Error saving game:", error);
            setStatus('Error saving progress.');
        }
    };

    const nextWord = (newPoints) => {
        const remainingWords = words.filter((word) => word !== currentWord);
        if (remainingWords.length > 0) {
            const next = remainingWords[0];
            setWords(remainingWords);
            setCurrentWord(next);
            setScrambledWord(shuffle(next));
            storeProgress(remainingWords, next, newPoints, strikes, pass, isGameOver);
        } else {
            setIsGameOver(true);
            storeProgress([], '', newPoints, strikes, pass, true);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="custom-card p-4 shadow-lg rounded">
                <h1 className="card-title text-center mb-4">Word Scramble</h1>
                {!isGameOver ? (
                    <div className="text-center">
                        <p className="h5 mb-4">
                            <strong className="scrambled-word">
                                {scrambledWord && scrambledWord.split("").map((letter, index) => (
                                    <span key={index} className="scrambled-letter">{letter}</span>
                                ))}
                            </strong>
                        </p>
                        <form onSubmit={submitGuess} className="mb-3">
                            <input
                                type="text"
                                className="form-control mb-2"
                                value={inputWord}
                                onChange={(e) => setInputWord(e.target.value)}
                                placeholder="Your guess"
                            />
                            <p className={`status-message ${status ? 'show' : ''} ${status === 'Correct!' ? 'text-success' : 'text-danger'}`}>
                                {status}
                            </p>
                            <button type="submit" className="btn btn-guess w-100">Guess</button>
                        </form>
                        <button
                            className="btn btn-skip w-100 mb-3"
                            onClick={Pass}
                            disabled={pass === 0}
                        >
                            Pass (Remaining: {pass})
                        </button>
                        <div className="points-container">
                            <p className="strikes">Strikes: {strikes}/{attempts}</p>
                            <p className="points">Points: {points}</p>
                        </div>
                    </div>
                ) : (
                    <div className="game-over-container">
                        <h2 className="game-over-title">Game Over!</h2>
                        <p className="game-over-points">
                            Your Points: <span className="game-over-points-value">{points}</span>
                        </p>
                        <button className="play-again-button" onClick={playGame}>Play Again</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScrambleGame;
