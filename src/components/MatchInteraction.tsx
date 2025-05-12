'use client';

import { useState, useId, useEffect } from 'react';
import Image from 'next/image';

interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

interface Prediction {
  team: string;
  score: number;
}

interface MatchInfo {
  map: string;
  mode: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
  bestOf: number;
}

export default function MatchInteraction() {
  const [isClient, setIsClient] = useState(false);
  const baseId = useId();
  const [voteOptions, setVoteOptions] = useState<VoteOption[]>([]);
  const [newOption, setNewOption] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [predictedWinner, setPredictedWinner] = useState<string>('');
  const [isPredictionSubmitted, setIsPredictionSubmitted] = useState(false);
  const [playerRegistration, setPlayerRegistration] = useState({
    name: '',
    rank: '',
    role: '',
    discord: '',
  });

  const matchInfo: MatchInfo = {
    map: 'Ascent',
    mode: 'Standard',
    date: 'March 15, 2024',
    time: '20:00 UTC',
    status: 'upcoming',
    bestOf: 3,
  };

  // Initialize state on client-side only
  useEffect(() => {
    setIsClient(true);
    setVoteOptions([
      { id: `${baseId}-1`, text: 'Sing', votes: 0 },
      { id: `${baseId}-2`, text: 'Dance', votes: 0 },
      { id: `${baseId}-3`, text: 'Act', votes: 0 },
    ]);
    setPredictions([
      { team: '500Bros', score: 0 },
      { team: 'Theanh96', score: 0 },
    ]);
  }, [baseId]);

  const handleVote = (optionId: string) => {
    setVoteOptions((options) =>
      options.map((option) =>
        option.id === optionId ? { ...option, votes: option.votes + 1 } : option
      )
    );
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const newId = `${baseId}-${voteOptions.length + 1}`;
      setVoteOptions((options) => [
        ...options,
        { id: newId, text: newOption.trim(), votes: 0 },
      ]);
      setNewOption('');
    }
  };

  const handlePredictionChange = (team: string, score: number) => {
    setPredictions(preds => {
      const newPreds = preds.map(pred =>
        pred.team === team ? { ...pred, score } : pred
      );

      // If we have a predicted winner, validate the scores
      if (predictedWinner) {
        const winnerPred = newPreds.find(p => p.team === predictedWinner);
        const loserPred = newPreds.find(p => p.team !== predictedWinner);
        
        if (winnerPred && loserPred) {
          // If the predicted winner's score is less than the loser's score,
          // adjust the loser's score to be less than the winner's
          if (winnerPred.score <= loserPred.score) {
            return newPreds.map(pred =>
              pred.team === loserPred.team
                ? { ...pred, score: Math.max(0, winnerPred.score - 1) }
                : pred
            );
          }
        }
      }

      return newPreds;
    });
  };

  const handleWinnerSelection = (team: string) => {
    setPredictedWinner(team);
    
    // Adjust scores when winner is selected
    setPredictions(preds => {
      const winnerPred = preds.find(p => p.team === team);
      const loserPred = preds.find(p => p.team !== team);
      
      if (winnerPred && loserPred) {
        // If loser's score is greater than or equal to winner's score,
        // adjust the loser's score to be less than the winner's
        if (loserPred.score >= winnerPred.score) {
          return preds.map(pred =>
            pred.team === loserPred.team
              ? { ...pred, score: Math.max(0, winnerPred.score - 1) }
              : pred
          );
        }
      }
      
      return preds;
    });
  };

  const handleSubmitPrediction = () => {
    if (
      predictedWinner &&
      predictions[0].score > 0 &&
      predictions[1].score > 0
    ) {
      const winnerPred = predictions.find(p => p.team === predictedWinner);
      const loserPred = predictions.find(p => p.team !== predictedWinner);
      
      // Final validation before submission
      if (winnerPred && loserPred && winnerPred.score > loserPred.score) {
        setIsPredictionSubmitted(true);
        // Here you would typically send the prediction to your backend
        console.log('Prediction submitted:', {
          scores: predictions,
          winner: predictedWinner,
        });
      }
    }
  };

  const handleRegistrationChange = (field: string, value: string) => {
    setPlayerRegistration((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Show loading state or nothing during SSR
  if (!isClient) {
    return (
      <div className='max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8'>
        <div className='bg-gray-800 rounded-lg p-4 sm:p-6 text-white animate-pulse'>
          <div className='h-8 bg-gray-700 rounded w-3/4 mb-4'></div>
          <div className='h-32 bg-gray-700 rounded'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8'>
      {/* Match Information */}
      <div className='bg-gray-800 rounded-lg p-4 sm:p-6 text-white'>
        <div className='flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0'>
          <div className='flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-start'>
            <div className='relative w-12 h-12 sm:w-16 sm:h-16'>
              <Image
                src='/500bros.png'
                alt='500Bros Logo'
                fill
                className='object-contain'
                priority
              />
            </div>
            <div>
              <h2 className='text-xl sm:text-2xl font-semibold'>500Bros</h2>
              <p className='text-gray-400 text-sm'>Professional Team</p>
            </div>
          </div>

          <div className='text-center'>
            <div className='bg-red-500 text-white px-3 sm:px-4 py-1 rounded-full text-sm font-semibold mb-2'>
              {matchInfo.status.toUpperCase()}
            </div>
            <p className='text-gray-400'>VS</p>
          </div>

          <div className='flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-end'>
            <div>
              <h2 className='text-xl sm:text-2xl font-semibold text-right'>Theanh96</h2>
              <p className='text-gray-400 text-sm text-right'>
                Content Creator
              </p>
            </div>
            <div className='relative w-12 h-12 sm:w-16 sm:h-16'>
              <Image
                src='/theanh96.png'
                alt='Theanh96 Logo'
                fill
                className='object-contain'
                priority
              />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 bg-gray-700/50 rounded-lg'>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <span className='text-gray-400'>Map:</span>
              <span className='font-semibold'>{matchInfo.map}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-gray-400'>Mode:</span>
              <span className='font-semibold'>{matchInfo.mode}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-gray-400'>Best of:</span>
              <span className='font-semibold'>{matchInfo.bestOf}</span>
            </div>
          </div>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <span className='text-gray-400'>Date:</span>
              <span className='font-semibold'>{matchInfo.date}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-gray-400'>Time:</span>
              <span className='font-semibold'>{matchInfo.time}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-gray-400'>Format:</span>
              <span className='font-semibold'>5v5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Streamer Action Voting */}
      <div className='bg-gray-800 rounded-lg p-4 sm:p-6 text-white'>
        <h2 className='text-xl sm:text-2xl font-semibold mb-4'>
          What do you want streamer to do?
        </h2>
        <div className='space-y-4'>
          {voteOptions.map((option) => (
            <div key={option.id} className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0'>
              <span className='text-sm sm:text-base'>{option.text}</span>
              <button
                onClick={() => handleVote(option.id)}
                className='w-full sm:w-auto bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm sm:text-base'
              >
                Vote ({option.votes})
              </button>
            </div>
          ))}
          <div className='flex flex-col sm:flex-row gap-2 mt-4'>
            <input
              type='text'
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder='Add new option...'
              className='flex-1 px-4 py-2 rounded bg-gray-700 text-white text-sm sm:text-base'
            />
            <button
              onClick={handleAddOption}
              className='w-full sm:w-auto bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-sm sm:text-base'
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Match Prediction */}
      <div className='bg-gray-800 rounded-lg p-4 sm:p-6 text-white'>
        <h2 className='text-xl sm:text-2xl font-semibold mb-4'>Predict the Match</h2>
        {!isPredictionSubmitted ? (
          <div className='space-y-6'>
            <div className='space-y-4'>
              {predictions.map(prediction => (
                <div
                  key={prediction.team}
                  className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0'
                >
                  <span className='text-sm sm:text-base'>{prediction.team}</span>
                  <input
                    type='number'
                    min='0'
                    max='13'
                    value={prediction.score}
                    onChange={(e) =>
                      handlePredictionChange(
                        prediction.team,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className='w-full sm:w-20 px-4 py-2 rounded bg-gray-700 text-white text-sm sm:text-base'
                  />
                </div>
              ))}
            </div>

            <div className='mt-6'>
              <label className='block text-base sm:text-lg font-semibold mb-3'>
                Who will win?
              </label>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {predictions.map((prediction) => (
                  <button
                    key={prediction.team}
                    onClick={() => handleWinnerSelection(prediction.team)}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                      predictedWinner === prediction.team
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className='flex items-center justify-center space-x-2'>
                      <div className='relative w-6 h-6 sm:w-8 sm:h-8'>
                        <Image
                          src={
                            prediction.team === '500Bros'
                              ? '/500bros.png'
                              : '/theanh96.png'
                          }
                          alt={`${prediction.team} Logo`}
                          fill
                          className='object-contain'
                          priority
                        />
                      </div>
                      <span className='font-semibold text-sm sm:text-base'>{prediction.team}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmitPrediction}
              disabled={
                !predictedWinner || 
                predictions.some((p) => p.score === 0) ||
                (() => {
                  const winnerPred = predictions.find(p => p.team === predictedWinner);
                  const loserPred = predictions.find(p => p.team !== predictedWinner);
                  return winnerPred && loserPred ? winnerPred.score <= loserPred.score : true;
                })()
              }
              className={`w-full mt-6 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                !predictedWinner || 
                predictions.some((p) => p.score === 0) ||
                (() => {
                  const winnerPred = predictions.find(p => p.team === predictedWinner);
                  const loserPred = predictions.find(p => p.team !== predictedWinner);
                  return winnerPred && loserPred ? winnerPred.score <= loserPred.score : true;
                })()
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Submit Prediction
            </button>
          </div>
        ) : (
          <div className='text-center py-6 sm:py-8'>
            <div className='text-green-500 text-xl sm:text-2xl font-semibold mb-2'>
              Prediction Submitted!
            </div>
            <p className='text-gray-400 text-sm sm:text-base'>
              You predicted {predictedWinner} to win with a score of{' '}
              {predictions[0].score} - {predictions[1].score}
            </p>
          </div>
        )}
      </div>

      {/* Player Registration */}
      <div className='bg-gray-800 rounded-lg p-4 sm:p-6 text-white'>
        <h2 className='text-xl sm:text-2xl font-semibold mb-4'>Register to Play</h2>
        <div className='space-y-4'>
          <div>
            <label className='block mb-2 text-sm sm:text-base'>Name</label>
            <input
              type='text'
              value={playerRegistration.name}
              onChange={(e) => handleRegistrationChange('name', e.target.value)}
              className='w-full px-4 py-2 rounded bg-gray-700 text-white text-sm sm:text-base'
            />
          </div>
          <div>
            <label className='block mb-2 text-sm sm:text-base'>Rank</label>
            <select
              value={playerRegistration.rank}
              onChange={(e) => handleRegistrationChange('rank', e.target.value)}
              className='w-full px-4 py-2 rounded bg-gray-700 text-white text-sm sm:text-base'
            >
              <option value=''>Select Rank</option>
              <option value='iron'>Iron</option>
              <option value='bronze'>Bronze</option>
              <option value='silver'>Silver</option>
              <option value='gold'>Gold</option>
              <option value='platinum'>Platinum</option>
              <option value='diamond'>Diamond</option>
              <option value='ascendant'>Ascendant</option>
              <option value='immortal'>Immortal</option>
              <option value='radiant'>Radiant</option>
            </select>
          </div>
          <div>
            <label className='block mb-2 text-sm sm:text-base'>Preferred Role</label>
            <select
              value={playerRegistration.role}
              onChange={(e) => handleRegistrationChange('role', e.target.value)}
              className='w-full px-4 py-2 rounded bg-gray-700 text-white text-sm sm:text-base'
            >
              <option value=''>Select Role</option>
              <option value='duelist'>Duelist</option>
              <option value='initiator'>Initiator</option>
              <option value='controller'>Controller</option>
              <option value='sentinel'>Sentinel</option>
            </select>
          </div>
          <div>
            <label className='block mb-2 text-sm sm:text-base'>Discord Username</label>
            <input
              type='text'
              value={playerRegistration.discord}
              onChange={(e) =>
                handleRegistrationChange('discord', e.target.value)
              }
              className='w-full px-4 py-2 rounded bg-gray-700 text-white text-sm sm:text-base'
              placeholder='username#0000'
            />
          </div>
          <button className='w-full bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded text-sm sm:text-base'>
            Register to Play
          </button>
        </div>
      </div>
    </div>
  );
}
