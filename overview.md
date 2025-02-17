# Iron Journal

**Iron Journal** is a comprehensive workout tracking and fitness progression application that supports sharing and posting workout programs and individual workouts, either publicly or privately.

## **Localization & Translation**

- Workouts are available in **Spanish and English**.
- Translations are stored in a **MongoDB database**.
- A **translation worker** processes tasks asynchronously from a **RabbitMQ message broker**, ensuring timely translations.
- Each translatable field includes both an **original** and a **native** version, so users always have content to view even if the translation is still in progress.

## **Workout Logging & Data Insights**

- Users can log and access their **workout data** and **set data** at any time.
- Logged data includes:
  - **Set type**
  - **Amount of weight used**
  - **Volume, distance**, and other performance metrics
- All measurements are automatically converted to the user's **preferred metric system**.
- Logged data is separate from the **workout programs**, which serve as training guidelines.
- Over time, the logged data will be used to generate **personalized performance insights and reviews**. These reviews will consider:
  - Specific weights used
  - Exercises performed
  - Body weight and other measurements
  - Water intake
  - Estimated fat percentage
  - Subjective mood ratings
- Users can also optionally log their **one rep maxes**, contributing to more accurate performance reviews.
- The application will potentially use a **linear regression model** to predict optimal weights for specific exercises.

## **Gamification & Engagement**

Gamification is a key component to keep data logging engaging and encourage daily use.

### **Achievements**

- Users can unlock **achievements** based on milestones and special conditions.
- Examples of achievements include:
  - 🏆 **"First Workout Logged"** - First workout entry.
  - 🔥 **"Consistency King"** - Log workouts for **30 days straight**.
  - 🏋️ **"Strength Beast"** - Hit **2x bodyweight deadlift**.
  - ⏳ **"Endurance Warrior"** - Complete **10 cardio sessions in a month**.
  - 🌙 **"Night Owl"** - Log a workout at **3 AM**.
- Achievements will provide **XP boosts** and **badges** to display in the user profile.

### **Challenges**

- Users can engage in **customized challenges** to push their limits.
- Examples of challenges include:
  - **Consistency Challenges** - Log workouts for **X days in a row**.
  - **Strength Challenges** - Increase weight lifted by **X%** over **4 weeks**.
  - **Endurance Challenges** - Complete **X miles of cardio per week**.
  - **Personal Best Challenges** - Achieve a new **1-rep max** in a specific lift.
- Challenges will **scale in difficulty**, adapting to the user's progress.
- Completing challenges will reward **XP**, **badges**, or **progression rewards**.

### **Leveling System**

- Users **gain XP** for logging data consistently, including:
  - Workout sessions
  - Body weight logs
  - Fat percentage tracking
  - One rep max submissions
- XP contributes to **leveling up**, which **rewards consistency and engagement**.
- The leveling system encourages users to stay consistent and progress over time.

### **Free Logging Policy**

- Users are free to **log any data**, even if it appears inaccurate, to support their own progression and leveling.
- Logged data **does not affect other users**.
- In the future, **competitions may require verified logs**, where users submit **video proof** of lifts for fair ranking.

## **Future Enhancements**

- Introduce **leaderboards for competitive users** (if later re-enabled).
- Expand **gamification with additional challenges, streaks, and milestones**.
- Host **competitions where users verify lifts with video submissions**.
- Improve **personalized recommendations using AI-driven insights**.
