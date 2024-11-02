import Bet from "../models/bet.model.js"; // Assuming you have a Bet model
import Result from "../models/result.model.js"; // Assuming you have a Result model
import User from "../models/user.model.js"; // Assuming you have a User model
import Wallet from "../models/wallet.model.js"; // Assuming you have a Wallet model
import GameTransaction from "../models/gameTransaction.model.js"; // Assuming you have a GameTransaction model
// Function to place a bet
import GameHistory from "../models/gameHistory.model.js";
export const placeBet = async (req, res) => {
  const { amount, betType, color, number, size, mode } = req.body;
  const userId = req.userId;

  try {
    // Fetch user and wallet
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Check wallet balance
    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Low balance" });
    }

    // Deduct 2% from the bet amount for processing
    const betAmountAfterDeduction = amount * 0.98;

    // Update user's wallet balance
    wallet.balance -= amount;
    await wallet.save();

    // Create a new bet
    const betData = {
      userId,
      amount: betAmountAfterDeduction,
      betType,
      ...(betType === "color" ? { color } : {}),
      ...(betType === "number" ? { number } : {}),
      ...(betType === "big/small" ? { size } : {}),
      mode,
    };

    const bet = new Bet(betData);
    await bet.save();

    // Log the game transaction
    const gameTransaction = new GameTransaction({
      userId,
      type: "debit",
      amount,
      mode,
      description: `Bet placed for ${betType}: ${number || color || size}`,
    });
    await gameTransaction.save();

    res.status(201).json({
      message: "Bet placed successfully",
      bet,
      remainingWalletBalance: wallet.balance,
    });
  } catch (error) {
    console.error("Error placing bet:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Function to generate result

export const createBetResultFor30s = async (req, res) => {
  try {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 25000); // 25 seconds in milliseconds

    // Retrieve bets placed in the last 25 seconds for the "30s" mode
    const bets = await Bet.find({
      mode: "30s", // Filter for 30-second mode
      createdAt: { $gte: thirtySecondsAgo }, // Only include bets from the last 30 seconds
    });
    const GameMode = "30s";
    // If no bets were placed, select a random number between 0 and 9
    if (bets.length === 0) {
      const randomNumber = Math.floor(Math.random() * 10);
      const result = new Result({
        grid: generateUniqueId(GameMode),
        number: Number(randomNumber), // Ensure it's a number
        color: getColorForNumber(randomNumber),
        smallOrBig: getSizeForNumber(randomNumber),
        mode: GameMode,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Save result to database
      await result.save();
      return res.status(200).json({
        message:
          "No bets were placed for this round. Selecting a random result.",
        result,
      });
    }

    // Initialize an object to hold payout details for each number
    const payoutDetails = {};

    // Total amount of bets for profit calculation
    let totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);

    // Iterate through numbers 0 to 9
    for (let number = 0; number <= 9; number++) {
      const numberBets = bets.filter(
        (bet) => bet.betType === "number" && bet.number === number
      );
      const sizeBets = bets.filter((bet) => bet.betType === "big/small");
      const colorBets = bets.filter((bet) => bet.betType === "color");

      let totalPayout = 0;

      // Check if there are bets on this number
      if (numberBets.length > 0) {
        // If there are bets on this number, calculate payouts
        totalPayout += numberBets.reduce((sum, bet) => sum + bet.amount * 9, 0); // Assuming 9x payout for the number
      }
      // Calculate total payouts for the current number based on your rules
      if (number === 0) {
        // For number 0
        const violetBets = colorBets.filter((bet) => bet.color === "Violet");
        totalPayout += violetBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Violet payout
        const redBets = colorBets.filter((bet) => bet.color === "Red");
        totalPayout += redBets.reduce((sum, bet) => sum + bet.amount * 1.5, 0); // Red payout
        const smallBets = colorBets.filter((bet) => bet.size === "Small");
        totalPayout += smallBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
      } else if (number === 1) {
        // For number 1
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 2) {
        // For number 2
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 3) {
        // For number 3
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 4) {
        // For number 4
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 5) {
        // For number 5
        const violetBets = colorBets.filter((bet) => bet.color === "Violet");
        totalPayout += violetBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Violet payout
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        const greenVioletBets = colorBets.filter(
          (bet) => bet.color === "Green"
        );
        totalPayout += greenVioletBets.reduce(
          (sum, bet) => sum + bet.amount * 1.5,
          0
        ); // Green-Violet payout
      } else if (number === 6) {
        // For number 6
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 7) {
        // For number 7
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 8) {
        // For number 8
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 9) {
        // For number 9
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      }

      // Store the payout details for this number
      payoutDetails[number] = totalPayout;
    }

    // Find the number with the least possible payout
    const winningNumber = Object.keys(payoutDetails).reduce((a, b) =>
      payoutDetails[a] < payoutDetails[b] ? a : b
    );
    const winningPayout = payoutDetails[winningNumber];

    // Calculate admin profit
   

    // Determine winning color based on the winning number
    const winningColor = getColorForNumber(winningNumber);
    const winningSize = getSizeForNumber(winningNumber);

    // Generate unique ID for result
    const gameResultId = generateUniqueId(GameMode);

    // Create result entry
    const result = new Result({
      grid: gameResultId,
      number: Number(winningNumber), // Ensure it's a number
      color: winningColor,
      smallOrBig: winningSize,
      mode: GameMode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save result to database
    await result.save();

    const winningBets = bets.filter(
      (bet) =>
        (bet.betType === "number" && bet.number === winningNumber) ||
        (bet.betType === "color" && bet.color === winningColor) ||
        (bet.betType === "big/small" && bet.size === winningSize)
    );

    for (const bet of winningBets) {
      const user = await User.findById(bet.userId);

      if (user) {
        // Calculate the payout amount based on the bet amount and bet type
        let payout = 0;
        if (bet.betType === "number") {
          // Assuming 9x payout for the number
          payout = bet.amount * 9;
        } else if (bet.betType === "color") {
          if (winningNumber === 0) {
            // For number 0
            if (bet.color === "Violet") {
              payout = bet.amount * 2; // Violet bet
            } else if (bet.color === "Red") {
              payout = bet.amount * 1.5; // Red bet
            }
          } else if (winningNumber === 5) {
            // For number 5
            if (bet.color === "Violet") {
              payout = bet.amount * 2; // Violet bet
            } else if (bet.color === "Green") {
              payout = bet.amount * 1.5; // Green bet
            }
          } else {
            // For other numbers
            payout = bet.color === winningColor ? bet.amount * 2 : 0; // General color payout
          }
        } else if (bet.betType === "big/small") {
          // Small/Big payout based on the size field
          payout = bet.size === winningSize ? bet.amount * 2 : 0;
        }

        // Update user's wallet balance
        const wallet = await Wallet.findOne({ user: user });
        if (!wallet)
          return res.status(404).json({ message: "Wallet not found" });
        wallet.balance += payout; // Add the payout amount to the wallet balance
        await wallet.save(); // Save the updated wallet

        const gameTransaction = new GameTransaction({
          userId: user._id, // Reference to the user
          type: "credit", // Type of transaction
          amount: payout, // Amount credited to the wallet
          mode: GameMode,
          description: `Payout for ${bet.betType} bet of amount ${bet.amount}`, // Description of the transaction
        });

        // Save the game transaction record
        await gameTransaction.save();

        // Update game history for the bet
        const gameHistoryEntry = new GameHistory({
          userId: user._id,
          betId: bet._id,
          betType: bet.betType,
          betAmount: bet.amount,
          mode: GameMode,
          result: {
            grid: gameResultId,
            number: winningNumber, // The winning number
            color: winningColor, // The color associated with the winning number
            size: winningSize, // The size associated with the winning result (e.g., "Big" or "Small")
          },
          status: "Win",
          payout: payout,
          createdAt: new Date(),
        });

        await gameHistoryEntry.save();
      }
    }

    // Mark remaining bets as "Lose" in game history
    const losingBets = bets.filter((bet) => !winningBets.includes(bet));
    for (const bet of losingBets) {
      const gameHistoryEntry = new GameHistory({
        userId: bet.userId,
        betId: bet._id,
        betType: bet.betType,
        betAmount: bet.amount,
        mode: GameMode,
        result: {
          grid: gameResultId,
          number: winningNumber, // The winning number
          color: winningColor, // The color associated with the winning number
          size: winningSize, // The size associated with the winning result (e.g., "Big" or "Small")
        },
        status: "Lose",
        payout: 0,
        createdAt: new Date(),
      });

      await gameHistoryEntry.save();
    }

    // Return the result as response
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating bet result:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const createBetResultFor1min = async (req, res) => {
  try {
    const now = new Date();
    const oneMinAgo = new Date(now.getTime() - 55000); // 1 min in milliseconds

    // Retrieve bets placed in the last 55 seconds for the "1 min" mode
    const bets = await Bet.find({
      mode: "1min", // Filter for 1 min mode
      createdAt: { $gte: oneMinAgo }, // Only include bets from the last 55 seconds
    });
    const GameMode = "1min";
    // If no bets were placed, select a random number between 0 and 9
    if (bets.length === 0) {
      const randomNumber = Math.floor(Math.random() * 10);

      const result = new Result({
        grid: generateUniqueId(GameMode),
        number: Number(randomNumber), // Ensure it's a number
        color: getColorForNumber(randomNumber),
        smallOrBig: getSizeForNumber(randomNumber),
        mode: GameMode,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Save result to database
      await result.save();
      return res.status(200).json({
        message:
          "No bets were placed for this round. Selecting a random result.",
        result,
      });
    }

    // Initialize an object to hold payout details for each number
    const payoutDetails = {};

    // Total amount of bets for profit calculation
    let totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);

    // Iterate through numbers 0 to 9
    for (let number = 0; number <= 9; number++) {
      const numberBets = bets.filter(
        (bet) => bet.betType === "number" && bet.number === number
      );
      const sizeBets = bets.filter((bet) => bet.betType === "big/small");
      const colorBets = bets.filter((bet) => bet.betType === "color");

      let totalPayout = 0;

      // Check if there are bets on this number
      if (numberBets.length > 0) {
        // If there are bets on this number, calculate payouts
        totalPayout += numberBets.reduce((sum, bet) => sum + bet.amount * 9, 0); // Assuming 9x payout for the number
      }
      // Calculate total payouts for the current number based on your rules
      if (number === 0) {
        // For number 0
        const violetBets = colorBets.filter((bet) => bet.color === "Violet");
        totalPayout += violetBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Violet payout
        const redBets = colorBets.filter((bet) => bet.color === "Red");
        totalPayout += redBets.reduce((sum, bet) => sum + bet.amount * 1.5, 0); // Red payout
        const smallBets = colorBets.filter((bet) => bet.size === "Small");
        totalPayout += smallBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
      } else if (number === 1) {
        // For number 1
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 2) {
        // For number 2
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 3) {
        // For number 3
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 4) {
        // For number 4
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 5) {
        // For number 5
        const violetBets = colorBets.filter((bet) => bet.color === "Violet");
        totalPayout += violetBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Violet payout
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        const greenVioletBets = colorBets.filter(
          (bet) => bet.color === "Green"
        );
        totalPayout += greenVioletBets.reduce(
          (sum, bet) => sum + bet.amount * 1.5,
          0
        ); // Green-Violet payout
      } else if (number === 6) {
        // For number 6
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 7) {
        // For number 7
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 8) {
        // For number 8
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 9) {
        // For number 9
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      }

      // Store the payout details for this number
      payoutDetails[number] = totalPayout;
    }

    // Find the number with the least possible payout
    const winningNumber = Object.keys(payoutDetails).reduce((a, b) =>
      payoutDetails[a] < payoutDetails[b] ? a : b
    );
    const winningPayout = payoutDetails[winningNumber];

    // Calculate admin profit
    

    // Determine winning color based on the winning number
    const winningColor = getColorForNumber(winningNumber);
    const winningSize = getSizeForNumber(winningNumber);

    // Generate unique ID for result
    const gameResultId = generateUniqueId(GameMode);

    // Create result entry
    const result = new Result({
      grid: gameResultId,
      number: Number(winningNumber), // Ensure it's a number
      color: winningColor,
      smallOrBig: winningSize,
      mode: GameMode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save result to database
    await result.save();

    const winningBets = bets.filter(
      (bet) =>
        (bet.betType === "number" && bet.number === winningNumber) ||
        (bet.betType === "color" && bet.color === winningColor) ||
        (bet.betType === "big/small" && bet.size === winningSize)
    );

    for (const bet of winningBets) {
      const user = await User.findById(bet.userId);

      if (user) {
        // Calculate the payout amount based on the bet amount and bet type
        let payout = 0;
        if (bet.betType === "number") {
          // Assuming 9x payout for the number
          payout = bet.amount * 9;
        } else if (bet.betType === "color") {
          if (winningNumber === 0) {
            // For number 0
            if (bet.color === "Violet") {
              payout = bet.amount * 2; // Violet bet
            } else if (bet.color === "Red") {
              payout = bet.amount * 1.5; // Red bet
            }
          } else if (winningNumber === 5) {
            // For number 5
            if (bet.color === "Violet") {
              payout = bet.amount * 2; // Violet bet
            } else if (bet.color === "Green") {
              payout = bet.amount * 1.5; // Green bet
            }
          } else {
            // For other numbers
            payout = bet.color === winningColor ? bet.amount * 2 : 0; // General color payout
          }
        } else if (bet.betType === "big/small") {
          // Small/Big payout based on the size field
          payout = bet.size === winningSize ? bet.amount * 2 : 0;
        }

        // Update user's wallet balance
        const wallet = await Wallet.findOne({ user: user });
        if (!wallet)
          return res.status(404).json({ message: "Wallet not found" });
        wallet.balance += payout; // Add the payout amount to the wallet balance
        await wallet.save(); // Save the updated wallet

        const gameTransaction = new GameTransaction({
          userId: user._id, // Reference to the user
          type: "credit", // Type of transaction
          amount: payout, // Amount credited to the wallet
          mode: GameMode,
          description: `Payout for ${bet.betType} bet of amount ${bet.amount}`, // Description of the transaction
        });

        // Save the game transaction record
        await gameTransaction.save();

        // Update game history for the bet
        const gameHistoryEntry = new GameHistory({
          userId: user._id,
          betId: bet._id,
          betType: bet.betType,
          betAmount: bet.amount,
          mode: GameMode,
          result: {
            grid: gameResultId,
            number: winningNumber, // The winning number
            color: winningColor, // The color associated with the winning number
            size: winningSize, // The size associated with the winning result (e.g., "Big" or "Small")
          },
          status: "Win",
          payout: payout,
          createdAt: new Date(),
        });

        await gameHistoryEntry.save();
      }
    }

    // Mark remaining bets as "Lose" in game history
    const losingBets = bets.filter((bet) => !winningBets.includes(bet));
    for (const bet of losingBets) {
      const gameHistoryEntry = new GameHistory({
        userId: bet.userId,
        betId: bet._id,
        betType: bet.betType,
        betAmount: bet.amount,
        mode: GameMode,
        result: {
          grid: gameResultId,
          number: winningNumber, // The winning number
          color: winningColor, // The color associated with the winning number
          size: winningSize, // The size associated with the winning result (e.g., "Big" or "Small")
        },
        status: "Lose",
        payout: 0,
        createdAt: new Date(),
      });

      await gameHistoryEntry.save();
    }

    // Return the result as response
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating bet result:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const createBetResultFor3min = async (req, res) => {
  try {
    const now = new Date();
    const threeMinAgo = new Date(now.getTime() - 175000); // 3 min in milliseconds
    // Retrieve bets placed in the last 175 seconds for the "3 min" mode
    const bets = await Bet.find({
      mode: "3min", // Filter for 3 min mode
      createdAt: { $gte: threeMinAgo }, // Only include bets from the last 175 seconds
    });
    const GameMode = "3min";
    // If no bets were placed, select a random number between 0 and 9
    if (bets.length === 0) {
      const randomNumber = Math.floor(Math.random() * 10);
      const result = new Result({
        grid: generateUniqueId(GameMode),
        number: Number(randomNumber), // Ensure it's a number
        color: getColorForNumber(randomNumber),
        smallOrBig: getSizeForNumber(randomNumber),
        mode: GameMode,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Save result to database
      await result.save();
      return res.status(200).json({
        message:
          "No bets were placed for this round. Selecting a random result.",
        result,
      });
    }

    // Initialize an object to hold payout details for each number
    const payoutDetails = {};

    // Total amount of bets for profit calculation
    let totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);

    // Iterate through numbers 0 to 9
    for (let number = 0; number <= 9; number++) {
      const numberBets = bets.filter(
        (bet) => bet.betType === "number" && bet.number === number
      );
      const sizeBets = bets.filter((bet) => bet.betType === "big/small");
      const colorBets = bets.filter((bet) => bet.betType === "color");

      let totalPayout = 0;

      // Check if there are bets on this number
      if (numberBets.length > 0) {
        // If there are bets on this number, calculate payouts
        totalPayout += numberBets.reduce((sum, bet) => sum + bet.amount * 9, 0); // Assuming 9x payout for the number
      }
      // Calculate total payouts for the current number based on your rules
      if (number === 0) {
        // For number 0
        const violetBets = colorBets.filter((bet) => bet.color === "Violet");
        totalPayout += violetBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Violet payout
        const redBets = colorBets.filter((bet) => bet.color === "Red");
        totalPayout += redBets.reduce((sum, bet) => sum + bet.amount * 1.5, 0); // Red payout
        const smallBets = colorBets.filter((bet) => bet.size === "Small");
        totalPayout += smallBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
      } else if (number === 1) {
        // For number 1
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 2) {
        // For number 2
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 3) {
        // For number 3
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 4) {
        // For number 4
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 5) {
        // For number 5
        const violetBets = colorBets.filter((bet) => bet.color === "Violet");
        totalPayout += violetBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Violet payout
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        const greenVioletBets = colorBets.filter(
          (bet) => bet.color === "Green"
        );
        totalPayout += greenVioletBets.reduce(
          (sum, bet) => sum + bet.amount * 1.5,
          0
        ); // Green-Violet payout
      } else if (number === 6) {
        // For number 6
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 7) {
        // For number 7
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 8) {
        // For number 8
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 9) {
        // For number 9
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      }

      // Store the payout details for this number
      payoutDetails[number] = totalPayout;
    }

    // Find the number with the least possible payout
    const winningNumber = Object.keys(payoutDetails).reduce((a, b) =>
      payoutDetails[a] < payoutDetails[b] ? a : b
    );
    const winningPayout = payoutDetails[winningNumber];

    // Calculate admin profit
    

    // Determine winning color based on the winning number
    const winningColor = getColorForNumber(winningNumber);
    const winningSize = getSizeForNumber(winningNumber);

    // Generate unique ID for result
    const gameResultId = generateUniqueId(GameMode);

    // Create result entry
    const result = new Result({
      grid: gameResultId,
      number: Number(winningNumber), // Ensure it's a number
      color: winningColor,
      smallOrBig: winningSize,
      mode: GameMode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save result to database
    await result.save();

    const winningBets = bets.filter(
      (bet) =>
        (bet.betType === "number" && bet.number === winningNumber) ||
        (bet.betType === "color" && bet.color === winningColor) ||
        (bet.betType === "big/small" && bet.size === winningSize)
    );

    for (const bet of winningBets) {
      const user = await User.findById(bet.userId);

      if (user) {
        // Calculate the payout amount based on the bet amount and bet type
        let payout = 0;
        if (bet.betType === "number") {
          // Assuming 9x payout for the number
          payout = bet.amount * 9;
        } else if (bet.betType === "color") {
          if (winningNumber === 0) {
            // For number 0
            if (bet.color === "Violet") {
              payout = bet.amount * 2; // Violet bet
            } else if (bet.color === "Red") {
              payout = bet.amount * 1.5; // Red bet
            }
          } else if (winningNumber === 5) {
            // For number 5
            if (bet.color === "Violet") {
              payout = bet.amount * 2; // Violet bet
            } else if (bet.color === "Green") {
              payout = bet.amount * 1.5; // Green bet
            }
          } else {
            // For other numbers
            payout = bet.color === winningColor ? bet.amount * 2 : 0; // General color payout
          }
        } else if (bet.betType === "big/small") {
          // Small/Big payout based on the size field
          payout = bet.size === winningSize ? bet.amount * 2 : 0;
        }

        // Update user's wallet balance
        const wallet = await Wallet.findOne({ user: user });
        if (!wallet)
          return res.status(404).json({ message: "Wallet not found" });
        wallet.balance += payout; // Add the payout amount to the wallet balance
        await wallet.save(); // Save the updated wallet

        const gameTransaction = new GameTransaction({
          userId: user._id, // Reference to the user
          type: "credit", // Type of transaction
          amount: payout, // Amount credited to the wallet
          mode: GameMode,
          description: `Payout for ${bet.betType} bet of amount ${bet.amount}`, // Description of the transaction
        });

        // Save the game transaction record
        await gameTransaction.save();

        // Update game history for the bet
        const gameHistoryEntry = new GameHistory({
          userId: user._id,
          betId: bet._id,
          betType: bet.betType,
          betAmount: bet.amount,
          mode: GameMode,
          result: {
            grid: gameResultId,
            number: winningNumber, // The winning number
            color: winningColor, // The color associated with the winning number
            size: winningSize, // The size associated with the winning result (e.g., "Big" or "Small")
          },
          status: "Win",
          payout: payout,
          createdAt: new Date(),
        });

        await gameHistoryEntry.save();
      }
    }

    // Mark remaining bets as "Lose" in game history
    const losingBets = bets.filter((bet) => !winningBets.includes(bet));
    for (const bet of losingBets) {
      const gameHistoryEntry = new GameHistory({
        userId: bet.userId,
        betId: bet._id,
        betType: bet.betType,
        betAmount: bet.amount,
        mode: GameMode,
        result: {
          grid: gameResultId,
          number: winningNumber, // The winning number
          color: winningColor, // The color associated with the winning number
          size: winningSize, // The size associated with the winning result (e.g., "Big" or "Small")
        },
        status: "Lose",
        payout: 0,
        createdAt: new Date(),
      });

      await gameHistoryEntry.save();
    }

    // Return the result as response
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating bet result:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const createBetResultFor5min = async (req, res) => {
  try {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 295000); // 5 min in milliseconds

    // Retrieve bets placed in the last 295 seconds for the "5 min" mode
    const bets = await Bet.find({
      mode: "5min", // Filter for 5 min mode
      createdAt: { $gte: fiveMinAgo }, // Only include bets from the last 295 seconds
    });
    const GameMode = "5min";
    // If no bets were placed, select a random number between 0 and 9
    if (bets.length === 0) {
      const randomNumber = Math.floor(Math.random() * 10);
      const result = new Result({
        grid: generateUniqueId(GameMode),
        number: Number(randomNumber), // Ensure it's a number
        color: getColorForNumber(randomNumber),
        smallOrBig: getSizeForNumber(randomNumber),
        mode: GameMode,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Save result to database
      await result.save();
      return res.status(200).json({
        message:
          "No bets were placed for this round. Selecting a random result.",
        result,
      });
    }

    // Initialize an object to hold payout details for each number
    const payoutDetails = {};

    // Total amount of bets for profit calculation
    let totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);

    // Iterate through numbers 0 to 9
    for (let number = 0; number <= 9; number++) {
      const numberBets = bets.filter(
        (bet) => bet.betType === "number" && bet.number === number
      );
      const sizeBets = bets.filter((bet) => bet.betType === "big/small");
      const colorBets = bets.filter((bet) => bet.betType === "color");

      let totalPayout = 0;

      // Check if there are bets on this number
      if (numberBets.length > 0) {
        // If there are bets on this number, calculate payouts
        totalPayout += numberBets.reduce((sum, bet) => sum + bet.amount * 9, 0); // Assuming 9x payout for the number
      }
      // Calculate total payouts for the current number based on your rules
      if (number === 0) {
        // For number 0
        const violetBets = colorBets.filter((bet) => bet.color === "Violet");
        totalPayout += violetBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Violet payout
        const redBets = colorBets.filter((bet) => bet.color === "Red");
        totalPayout += redBets.reduce((sum, bet) => sum + bet.amount * 1.5, 0); // Red payout
        const smallBets = colorBets.filter((bet) => bet.size === "Small");
        totalPayout += smallBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
      } else if (number === 1) {
        // For number 1
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 2) {
        // For number 2
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 3) {
        // For number 3
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 4) {
        // For number 4
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Small")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Small payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 5) {
        // For number 5
        const violetBets = colorBets.filter((bet) => bet.color === "Violet");
        totalPayout += violetBets.reduce((sum, bet) => sum + bet.amount * 2, 0); // Violet payout
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        const greenVioletBets = colorBets.filter(
          (bet) => bet.color === "Green"
        );
        totalPayout += greenVioletBets.reduce(
          (sum, bet) => sum + bet.amount * 1.5,
          0
        ); // Green-Violet payout
      } else if (number === 6) {
        // For number 6
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 7) {
        // For number 7
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      } else if (number === 8) {
        // For number 8
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Red")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Red payout
      } else if (number === 9) {
        // For number 9
        totalPayout += sizeBets
          .filter((bet) => bet.size === "Big")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Big payout
        totalPayout += colorBets
          .filter((bet) => bet.color === "Green")
          .reduce((sum, bet) => sum + bet.amount * 2, 0); // Green payout
      }

      // Store the payout details for this number
      payoutDetails[number] = totalPayout;
    }

    // Find the number with the least possible payout
    const winningNumber = Object.keys(payoutDetails).reduce((a, b) =>
      payoutDetails[a] < payoutDetails[b] ? a : b
    );
    const winningPayout = payoutDetails[winningNumber];

    // Calculate admin profit
    

    // Determine winning color based on the winning number
    const winningColor = getColorForNumber(winningNumber);
    const winningSize = getSizeForNumber(winningNumber);

    // Generate unique ID for result
    const gameResultId = generateUniqueId(GameMode);

    // Create result entry
    const result = new Result({
      grid: gameResultId,
      number: Number(winningNumber), // Ensure it's a number
      color: winningColor,
      smallOrBig: winningSize,
      mode: GameMode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save result to database
    await result.save();

    const winningBets = bets.filter(
      (bet) =>
        (bet.betType === "number" && bet.number === winningNumber) ||
        (bet.betType === "color" && bet.color === winningColor) ||
        (bet.betType === "big/small" && bet.size === winningSize)
    );

    for (const bet of winningBets) {
      const user = await User.findById(bet.userId);

      if (user) {
        // Calculate the payout amount based on the bet amount and bet type
        let payout = 0;

        if (bet.betType === "number") {
          // Assuming 9x payout for the number
          payout = bet.amount * 9;
        } else if (bet.betType === "color") {
          if (winningNumber === 0) {
            // For number 0
            if (bet.color === "Violet") {
              payout = bet.amount * 2; // Violet bet
            } else if (bet.color === "Red") {
              payout = bet.amount * 1.5; // Red bet
            }
          } else if (winningNumber === 5) {
            // For number 5
            if (bet.color === "Violet") {
              payout = bet.amount * 2; // Violet bet
            } else if (bet.color === "Green") {
              payout = bet.amount * 1.5; // Green bet
            }
          } else {
            // For other numbers
            payout = bet.color === winningColor ? bet.amount * 2 : 0; // General color payout
          }
        } else if (bet.betType === "big/small") {
          // Small/Big payout based on the size field
          payout = bet.size === winningSize ? bet.amount * 2 : 0;
        }

        // Update user's wallet balance
        const wallet = await Wallet.findOne({ user: user });
        if (!wallet)
          return res.status(404).json({ message: "Wallet not found" });
        wallet.balance += payout; // Add the payout amount to the wallet balance
        await wallet.save(); // Save the updated wallet

        const gameTransaction = new GameTransaction({
          userId: user._id, // Reference to the user
          type: "credit", // Type of transaction
          amount: payout, // Amount credited to the wallet
          mode: GameMode,
          description: `Payout for ${bet.betType} bet of amount ${bet.amount}`, // Description of the transaction
        });

        // Save the game transaction record
        await gameTransaction.save();

        // Update game history for the bet
        const gameHistoryEntry = new GameHistory({
          userId: user._id,
          betId: bet._id,
          betType: bet.betType,
          betAmount: bet.amount,
          mode: GameMode,
          result: {
            grid: gameResultId,
            number: winningNumber, // The winning number
            color: winningColor, // The color associated with the winning number
            size: winningSize, // The size associated with the winning result (e.g., "Big" or "Small")
          },
          status: "Win",
          payout: payout,
          createdAt: new Date(),
        });

        await gameHistoryEntry.save();
      }
    }

    // Mark remaining bets as "Lose" in game history
    const losingBets = bets.filter((bet) => !winningBets.includes(bet));
    for (const bet of losingBets) {
      const gameHistoryEntry = new GameHistory({
        userId: bet.userId,
        betId: bet._id,
        betType: bet.betType,
        betAmount: bet.amount,
        mode: GameMode,
        result: {
          grid: gameResultId,
          number: winningNumber, // The winning number
          color: winningColor, // The color associated with the winning number
          size: winningSize, // The size associated with the winning result (e.g., "Big" or "Small")
        },
        status: "Lose",
        payout: 0,
        createdAt: new Date(),
      });

      await gameHistoryEntry.save();
    }

    // Return the result as response
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating bet result:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Helper function to get color based on the winning number
function getColorForNumber(number) {
  if (number == 0) return "RedViolet";
  if (number == 5) return "GreenViolet";
  if (number == 1 || number == 3 || number == 7 || number == 9) return "Green";
  if (number == 2 || number == 4 || number == 6 || number == 8) return "Red";
}

// Helper function to get size based on the winning number
function getSizeForNumber(number) {
  return number < 5 ? "Small" : "Big";
}

// Unique ID generation logic
let sequenceCounter = 0; // Initialize the counter for sequential IDs

const modeCounters = {
  "30s": 0,
  "1min": 0,
  "3min": 0,
  "5min": 0,
};

const generateUniqueId = (mode) => {
  // Get current date and time parts
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Increment the mode-specific counter
  modeCounters[mode]++;

  // Format the counter as a 3-digit string for uniqueness
  const uniqueCounter = String(modeCounters[mode]).padStart(3, '0');

  // Reset the counter for the mode if it reaches 1000 to avoid overflow
  if (modeCounters[mode] === 1000) modeCounters[mode] = 0;

  // Combine all parts to form the unique ID
  return `${year}${month}${day}${hours}${minutes}${seconds}${uniqueCounter}`;
};

