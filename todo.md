# TODO

## Primary Initiative

### Important Steps

- Add Statistics like average weekly volume per body part.
- Make Sets independent from workouts, for scalability.
- Add an admin review system for flagged content, so user can report content for programs, workouts, and users accounts can be reported for usernames for example.

### LOW PRIORITY

### Back Burner

- Make so assisted sets are accounted for, using assisted equipment for example
- Add Accessory-Equipment to both the Iset, ISetDataEntry, and IOneRepMaxData
- MyFitnessPal integration, to obtains additional data for neo4j
- Challenges (Weekly/Monthly)
- Add Achievement

## NOTES

### Gamification inside of application

### **Iron Journal Beta Feature Roadmap**

#### ✅ Must-Have for Beta

These features ensure core engagement and habit-building from day one.

#### **1. Streak & Streak Breaking Mechanics**

- **Why?** Encourages consistency without punishing users too harshly.
- **Implementation:** Advertise a 1-day break but provide a 2–3 day buffer for restoring streaks.

#### **2. Leveling System (XP & Achievements Framework)**

- **Why?** Progression motivates users.
- **Implementation:** Assign XP for completed workouts, challenges, and logging workouts.

#### **3. Weekly/Monthly Challenges with XP Rewards**

- **Why?** Adds replayability and a sense of urgency.
- **Implementation:** Simple challenges like "Workout 3x this week" or "Lift X kg total."

#### **4. Basic Achievements & UI Feedback for Unlocks**

- **Why?** Creates small dopamine hits when completing tasks.
- **Implementation:** Use a **strategy pattern** for achievements and include them in the server response.

#### **5. Friends & Social Engagement**

- **Why?** Social connections **increase retention** significantly.
- **Implementation:** Simple **friend list system** with activity updates (e.g., “Jason just hit a PR!”).

#### **6. Basic Reputation Tracking (Engagement Score)**

- **Why?** Helps measure valuable users and **potentially reward them later**.
- **Implementation:** Track workout streaks, XP earned, and challenge participation.

---

### 🚀 Save for Later (Post-Beta, More Complexity or Social Focus)

These features are great but require more work or polish.

#### **1. Asynchronous User Challenges (Lifting Duels with Video Proof)**

- **Why?** It’s a great idea but requires **video uploads, moderation, and challenge handling**, which increases complexity.

#### **2. Scarcity-Based Challenges (Random & Rare XP Boosters)**

- **Why?** Could be fun but might be overwhelming early on. Add later once the **challenge system is solid**.

#### **3. Unlocking Sets of Achievements by Leveling Up**

- **Why?** Cool progression system but not necessary for beta. Introduce after more achievements exist.

#### **4. Sharing Achievements/Badges**

- **Why?** Useful for social engagement but lower priority. Start with **individual achievements first**.

---

### 🏗️ Potential Additional Features for Beta

- **Basic Workout Stats Leaderboard (Optional)**

  - Let users compare **XP or streaks** with friends.

- **Personalized Challenge Suggestions**
  - Use past workouts to suggest relevant challenges.

- **Milestone Celebrations (Popup/UI Feedback)**
  - “Congrats on logging 10 workouts!” - quick wins to **reinforce habit loops**.

---

### 🎯 **Summary**

#### ✅ **Include in Beta**

1. **Streak mechanics** (1-3 day buffer)
2. **XP & leveling system**
3. **Basic weekly/monthly challenges**
4. **Basic achievement system**
5. **Friends & social activity feed**
6. **Basic reputation tracking**

### 🚀 **Post-Beta Expansion**

1. **Async lifting challenges w/ video**
2. **Rare challenges (XP boosters)**
3. **Unlockable achievement tiers**
4. **Sharing badges & achievements**

### ML inside of APP

- Add regression model with neo4j, To predict the optimal weight for exercises, a common algorithm approach would be to use a regression model based on historical training data, incorporating factors like previous weight lifted, sets and reps performed, rest periods, muscle group targeted, and overall fitness level
- ML algorithm for, A prediction algorithm for adjusting a workout program would typically use machine learning techniques to analyze data like past workout performance, heart rate, sleep patterns, nutrition, and other relevant metrics to predict when and how to adjust training variables like intensity, volume, exercise selection, or rest days

### React Native Development

- Dates will be formatted on retrieval by the application.
- All dates should be sent using Date.toISOString(). Display stuff in users local timezone, then take the localDate and do localDate.toISOString()

| Level | Title                        | Description                                      |                        |
|-------|------------------------------|--------------------------------------------------|------------------------|
| 0     | Novice Lifter 🏋️            | Just starting the journey, eager to learn.      |                        |
| 5     | Committed Trainee 💪         | Developing consistency and tracking progress.   |        View Public Workouts             |
| 10    | Disciplined Grinder 🔄       | Putting in the work, seeing early gains.        |          View Public Programs          |
| 15    | Strength Seeker 🏆           | Focused on improving, unlocking new abilities.  |     Create Public Workouts            |
| 20    | Iron Warrior ⚔️             | Dedicated to structured workouts and progress.  |           Create Public Programs      |
| 25    | Seasoned Lifter 🔥          | More experienced, sharing insights with others. |                        |
| 30    | Elite Athlete 🏅            | Mastering training techniques, setting records. |                        |
| 35    | Iron Veteran 🦾            | A highly experienced lifter, guiding others.    |                        |
| 40    | Master of the Barbell 🏋️‍♂️ | A true expert, optimizing strength and endurance. |                        |
| 45    | Gym Titan ⚡                 | Dominating the gym, pushing the limits.         |                        |
| 50    | Legend of Iron 👑           | A master of training, inspiring the next generation. |                        |
