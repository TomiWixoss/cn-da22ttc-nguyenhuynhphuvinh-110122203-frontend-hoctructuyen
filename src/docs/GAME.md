### **Phần 1: Thống nhất tiền tệ, chỉ sử dụng SynCoin**

Mục tiêu của phần này là loại bỏ hoàn toàn "Kristal". Mọi chức năng mua bán, trao thưởng... sẽ được quy đổi về SynCoin.

#### **Bước 1.1: Cập nhật Models**

1.  **`models/currency.js`**:

    - Bạn nên xóa bản ghi (seed data) cho "Kristal". Nếu bạn đang tạo dữ liệu tự động, hãy đảm bảo chỉ tạo "SYNC".

2.  **`models/userCurrency.js`**:

    - Model này được thiết kế để hỗ trợ nhiều loại tiền tệ, vì vậy bạn không cần xóa nó. Tuy nhiên, logic trong các service sẽ chỉ tương tác với `currency_id` của SynCoin.
    - **Trong database:** Cột `kristal_balance` trong bảng `Users` (nếu có) và các tham chiếu tương tự sẽ không còn được sử dụng. Bạn nên tạo một migration để xóa cột này nhằm dọn dẹp cơ sở dữ liệu.

3.  **`models/eggType.js`**:

    - Loại bỏ `base_price_kristal`. Tất cả giá sẽ được tính bằng `base_price_syncoin`.
    - Cập nhật phương thức `getPurchaseInfo`:

    ```javascript
    // trong file: backend/src/models/eggType.js
    // ... trong class EggType
    getPurchaseInfo() {
        return {
            can_purchase: this.isPurchasable(),
            price: this.base_price_syncoin,
            currency_type: 'SYNCOIN'
        };
    }
    ```

4.  **`models/skill.js`**:

    - Thay đổi `cost_type` ENUM để chỉ còn `SYNCOIN`.
    - Cập nhật tất cả các `skill` có `cost_type` là `KRISTAL` thành `SYNCOIN` và quy đổi `cost_amount` (ví dụ: 1 Kristal = 100 SynCoin).

    ```javascript
    // trong file: backend/src/models/skill.js
    // ... trong hàm init
    cost_type: {
        type: DataTypes.ENUM('SYNCOIN'), // Chỉ còn SYNCOIN
        allowNull: false
    },
    ```

5.  **`models/eggOpeningHistory.js`**:
    - Loại bỏ các cột `total_value_kristal` và `kristal_from_duplicates`. Mọi giá trị quy đổi sẽ được tính bằng SynCoin.

#### **Bước 1.2: Cập nhật Services**

1.  **`services/currencyService.js`**:

    - Đây là nơi cần thay đổi nhiều nhất. Đơn giản hóa các phương thức để chúng không cần kiểm tra `currencyCode` nữa mà mặc định là "SYNC".
    - Ví dụ, `awardCurrency` và `spendCurrency` có thể không cần tham số `currencyCode` nữa, hoặc mặc định nó là "SYNC".
    - Loại bỏ các phương thức helper như `getKristal()`.

2.  **`services/eggRewardService.js`**:

    - Cập nhật logic xử lý phần thưởng khi mở trứng. Nếu nhận được vật phẩm trùng lặp, hãy thưởng SynCoin thay vì Kristal.
    - Sửa đổi phương thức `getItemKristalValue` thành `getItemSynCoinValue` và trả về giá trị SynCoin.

    ```javascript
    // trong file: backend/src/services/eggRewardService.js
    // ... trong class EggRewardService
    static getItemSynCoinValue(itemType) { // Đổi tên và giá trị
        const values = {
            'AVATAR': 1000, // Ví dụ: 10 Kristal cũ = 1000 SynCoin
            'EMOJI': 500,
        };
        return values[itemType] || 500;
    }

    static async processEggRewards(userId, rewards) {
        // ...
        if (ownsItem) {
            // Convert to SynCoin
            const synCoinValue = this.getItemSynCoinValue(reward.reward_type);
            await CurrencyService.awardCurrency(userId, 'SYNC', synCoinValue, 'DUPLICATE_CONVERSION'); // Thưởng SynCoin

            rewardData.was_duplicate = true;
            rewardData.syncoin_compensation = synCoinValue; // Đổi tên trường
            hadDuplicates = true;
            syncoinFromDuplicates += synCoinValue;
            totalSyncoinValue += synCoinValue;
        }
        // ...
    }
    ```

3.  **`services/skillService.js` và `services/shopController.js`**:

    - Trong `purchaseSkill` (skillService) và `purchase` (shopController), đảm bảo rằng logic thanh toán chỉ sử dụng `currencyService` với tiền tệ "SYNC".
    - Cập nhật `getEmojiPrice` trong `shopController` để trả về giá SynCoin.

    ```javascript
    // trong file: backend/src/controllers/shopController.js
    // ... trong class ShopController
    static getEmojiPrice(emoji) {
        if (emoji.kristal_price && emoji.kristal_price > 0) {
            return emoji.kristal_price * 100; // Quy đổi 1 Kristal = 100 SynCoin
        }
        const rarityPrices = {
            'COMMON': 1000,
            'RARE': 2500,
            'EPIC': 3500,
            'LEGENDARY': 5000
        };
        return rarityPrices[emoji.rarity] || 1500;
    }
    ```

---

### **Phần 2: Loại bỏ Frame và Name Effect**

Phần này sẽ xóa hoàn toàn các chức năng liên quan đến Khung viền (Frame) và Hiệu ứng tên (Name Effect) khỏi hệ thống.

#### **Bước 2.1: Xóa các file không cần thiết**

Bạn có thể xóa hoàn toàn các file sau:

- `models/avatarFrame.js`
- `models/nameEffect.js`
- `controllers/frameShopController.js`

#### **Bước 2.2: Cập nhật Models có liên quan**

1.  **`models/userCustomization.js`**:

    - Xóa các trường `equipped_frame_id` và `equipped_name_effect_id`.
    - Xóa các associations `EquippedFrame` và `EquippedNameEffect`.
    - Xóa các phương thức static `equipFrame`, `equipNameEffect`.
    - Đơn giản hóa phương thức `getUserCustomization` và `getFormattedInfo`.

2.  **`models/userInventory.js`**:

    - Cập nhật ENUM `item_type` để loại bỏ 'FRAME' và 'NAME_EFFECT'.
    - Xóa các associations `AvatarFrame` và `NameEffect`.
    - Cập nhật phương thức `getUserCompleteInventory` để loại bỏ logic cho frame và name effect.

    ```javascript
    // trong file: backend/src/models/userInventory.js
    // ... trong hàm init
    item_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['AVATAR', 'EMOJI']] // Chỉ còn AVATAR và EMOJI
        },
        comment: 'Loại vật phẩm'
    },
    ```

3.  **`models/eggReward.js`**:

    - Cập nhật ENUM `reward_type` để loại bỏ 'FRAME' và 'NAME_EFFECT'.

    ```javascript
    // trong file: backend/src/models/eggReward.js
    // ... trong hàm init
    reward_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['AVATAR', 'EMOJI', 'SYNCOIN', 'KRISTAL', 'XP']] // Bỏ FRAME và NAME_EFFECT
        }
    },
    ```

#### **Bước 2.3: Cập nhật Services có liên quan**

1.  **`services/avatarCustomizationService.js`**:
    - Xóa hoàn toàn các phương thức `equipFrame`, `unequipFrame`, `equipNameEffect`, `unequipNameEffect`.
    - Trong `initializeUserAvatarSystem`, xóa logic thêm `defaultFrame`.
    - Trong `getUserAvatarData`, `getAvailableItems`, `unlockItemsByLevel`, `getUserDisplayInfo`, `getCollectionProgress`, xóa tất cả logic và tham chiếu đến Frame và Name Effect.

#### **Bước 2.4: Cập nhật Controllers và Routes có liên quan**

1.  **`controllers/avatarCustomizationController.js`**:

    - Xóa các phương thức static tương ứng đã bị xóa trong service.
    - Xóa `getAllFrames` và các phương thức liên quan đến Name Effect.

2.  **`routes/avatarCustomizationRoutes.js`**:

    - Xóa các route liên quan đến `frames` và `name-effects`.
    - Xóa các route cho `frameShopController`.

    ```javascript
    // File: backend/src/routes/avatarCustomizationRoutes.js (sau khi sửa)
    "use strict";

    const express = require("express");
    const router = express.Router();
    const AvatarCustomizationController = require("../controllers/avatarCustomizationController");
    const { authenticateToken } = require("../middleware/authMiddleware");

    // Các route còn lại cho AVATAR và EMOJI
    router.post(
      "/initialize",
      authenticateToken,
      AvatarCustomizationController.initializeAvatarSystem
    );
    router.get(
      "/my-data",
      authenticateToken,
      AvatarCustomizationController.getUserAvatarData
    );
    router.get(
      "/available-items",
      authenticateToken,
      AvatarCustomizationController.getAvailableItems
    );
    router.get(
      "/inventory/:itemType",
      authenticateToken,
      AvatarCustomizationController.getUserInventoryByType
    );
    router.post(
      "/equip",
      authenticateToken,
      AvatarCustomizationController.equipItem
    );
    router.post(
      "/unequip",
      authenticateToken,
      AvatarCustomizationController.unequipItem
    );
    router.get(
      "/customization",
      authenticateToken,
      AvatarCustomizationController.getUserCustomization
    );
    router.put(
      "/customization",
      authenticateToken,
      AvatarCustomizationController.updateCustomizationSettings
    );
    router.get(
      "/display-info/:userId",
      authenticateToken,
      AvatarCustomizationController.getUserDisplayInfo
    );
    router.get(
      "/display-info",
      authenticateToken,
      AvatarCustomizationController.getUserDisplayInfo
    );
    router.get(
      "/collection-progress",
      authenticateToken,
      AvatarCustomizationController.getCollectionProgress
    );
    router.get(
      "/avatars",
      authenticateToken,
      AvatarCustomizationController.getAllAvatars
    );
    router.get(
      "/emojis",
      authenticateToken,
      AvatarCustomizationController.getAllEmojis
    );

    module.exports = router;
    ```

---

### **Phần 3: Dọn dẹp Database (Migration)**

Sau khi đã thay đổi mã nguồn, bạn cần tạo một file migration của Sequelize để áp dụng các thay đổi này vào cơ sở dữ liệu.

**Tạo file migration mới:**

```bash
npx sequelize-cli migration:generate --name refactor-gamification-v2
```

**Nội dung file migration (`YYYYMMDDHHMMSS-refactor-gamification-v2.js`):**

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ===== PHẦN 1: DỌN DẸP KRISTAL =====
      // Xóa các cột liên quan đến Kristal
      console.log("Removing Kristal related columns...");
      await queryInterface.removeColumn("UserCurrencies", "kristal_balance", {
        transaction,
      });
      await queryInterface.removeColumn(
        "EggOpeningHistory",
        "total_value_kristal",
        { transaction }
      );
      await queryInterface.removeColumn(
        "EggOpeningHistory",
        "kristal_from_duplicates",
        { transaction }
      );
      await queryInterface.removeColumn("EggTypes", "base_price_kristal", {
        transaction,
      });

      // Cập nhật ENUM của skill cost_type
      console.log("Updating ENUM for Skill cost_type...");
      await queryInterface.sequelize.query(
        'ALTER TYPE "enum_Skills_cost_type" RENAME TO "enum_Skills_cost_type_old";',
        { transaction }
      );
      await queryInterface.sequelize.query(
        "CREATE TYPE \"enum_Skills_cost_type\" AS ENUM('SYNCOIN');",
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE "Skills" ALTER COLUMN cost_type TYPE "enum_Skills_cost_type" USING cost_type::text::"enum_Skills_cost_type";',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'DROP TYPE "enum_Skills_cost_type_old";',
        { transaction }
      );

      // Xóa bản ghi tiền tệ Kristal
      await queryInterface.bulkDelete(
        "Currencies",
        { currency_code: "KRIS" },
        { transaction }
      );

      // ===== PHẦN 2: DỌN DẸP FRAME & NAME EFFECT =====
      console.log(
        "Dropping Frame and NameEffect related tables and columns..."
      );
      // Xóa các cột foreign key trong UserCustomization
      await queryInterface.removeColumn(
        "UserCustomization",
        "equipped_frame_id",
        { transaction }
      );
      await queryInterface.removeColumn(
        "UserCustomization",
        "equipped_name_effect_id",
        { transaction }
      );

      // Xóa các bản ghi liên quan trong UserInventory
      await queryInterface.bulkDelete(
        "UserInventory",
        { item_type: ["FRAME", "NAME_EFFECT"] },
        { transaction }
      );

      // Xóa các bảng
      await queryInterface.dropTable("AvatarFrames", { transaction });
      await queryInterface.dropTable("NameEffects", { transaction });

      // Cập nhật các ENUM liên quan
      console.log("Updating ENUMs for item_type and reward_type...");
      // UserInventory.item_type
      await queryInterface.sequelize.query(
        'ALTER TYPE "enum_UserInventory_item_type" RENAME TO "enum_UserInventory_item_type_old";',
        { transaction }
      );
      await queryInterface.sequelize.query(
        "CREATE TYPE \"enum_UserInventory_item_type\" AS ENUM('AVATAR', 'EMOJI');",
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE "UserInventory" ALTER COLUMN item_type TYPE "enum_UserInventory_item_type" USING item_type::text::"enum_UserInventory_item_type";',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'DROP TYPE "enum_UserInventory_item_type_old";',
        { transaction }
      );

      // EggReward.reward_type
      await queryInterface.sequelize.query(
        'ALTER TYPE "enum_EggRewards_reward_type" RENAME TO "enum_EggRewards_reward_type_old";',
        { transaction }
      );
      await queryInterface.sequelize.query(
        "CREATE TYPE \"enum_EggRewards_reward_type\" AS ENUM('AVATAR', 'EMOJI', 'SYNCOIN', 'XP');",
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE "EggRewards" ALTER COLUMN reward_type TYPE "enum_EggRewards_reward_type" USING reward_type::text::"enum_EggRewards_reward_type";',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'DROP TYPE "enum_EggRewards_reward_type_old";',
        { transaction }
      );

      console.log("Migration completed successfully.");
    });
  },

  async down(queryInterface, Sequelize) {
    // Lưu ý: Hàm down() rất phức tạp để viết lại chính xác, chủ yếu dùng để rollback trong quá trình phát triển.
    // Trong môi trường production, thường sẽ tiến tới thay vì rollback.
    console.log(
      "Rolling back this migration is complex and not fully supported. Please restore from backup if needed."
    );
  },
};
```

**Chạy migration:**

```bash
npx sequelize-cli db:migrate
```

### **Tổng kết và các bước tiếp theo**

Sau khi hoàn thành các bước trên, hệ thống của bạn sẽ được đơn giản hóa đáng kể:

1.  **Tiền tệ:** Chỉ còn SynCoin, giúp logic kinh tế trong game trở nên dễ quản lý và cân bằng hơn.
2.  **Vật phẩm:** Chỉ còn Avatar và Emoji, tập trung vào các yếu tố tùy chỉnh cốt lõi.
3.  **Cơ sở dữ liệu:** Gọn gàng hơn sau khi loại bỏ các bảng và cột không cần thiết.
4.  **Mã nguồn:** Ít phức tạp hơn, dễ bảo trì và mở rộng hơn trong tương lai.

**Các bước tiếp theo:**

- **Kiểm tra toàn diện (Testing):** Chạy lại tất cả các luồng liên quan đến gamification: đăng ký, làm quiz, lên cấp, mua sắm, mở trứng, v.v. để đảm bảo không có lỗi phát sinh.
- **Cập nhật Frontend:** Frontend cần được cập nhật để loại bỏ các giao diện liên quan đến Kristal, Frame, và Name Effect.
- **Xem xét lại Seed Data:** Cập nhật các file seed (dữ liệu mẫu) để chúng không còn chứa các loại vật phẩm hoặc tiền tệ đã bị loại bỏ.

## **Phần 4: Xóa hệ thống SKILL**

### **Bước 1: Xóa các file Model, Service, Controller và Route cốt lõi của hệ thống Skill**

Đây là những file chỉ dành riêng cho hệ thống Skill và có thể được xóa một cách an toàn.

1.  **Xóa Models:**

    - `backend/src/models/skill.js`
    - `backend/src/models/userSkill.js`
    - `backend/src/models/quizSkillLoadout.js`
    - `backend/src/models/skillUsageHistory.js`
    - `backend/src/models/activeSkillEffect.js`

2.  **Xóa Service:**

    - `backend/src/services/skillService.js`

3.  **Xóa Controller:**

    - `backend/src/controllers/skillController.js`

4.  **Xóa Route File:**

    - `backend/src/routes/skillRoutes.js`

5.  **Cập nhật file đăng ký route chính (thường là `app.js` hoặc `index.js` ở thư mục gốc):**
    - Tìm và xóa dòng `app.use('/api/skills', ...)` hoặc tương tự để gỡ bỏ việc sử dụng `skillRoutes`.

---

### **Bước 2: Chỉnh sửa các file có tích hợp hệ thống Skill**

Nhiều file khác có sử dụng hoặc tham chiếu đến hệ thống Skill. Bạn cần loại bỏ các đoạn mã này.

#### **2.1. Cập nhật Models**

1.  **`models/user.js`**:

    - Trong hàm `associate`, xóa tất cả các dòng định nghĩa quan hệ với các model Skill đã bị xóa:

    ```javascript
    // Xóa các dòng sau trong file: backend/src/models/user.js
    User.hasMany(models.UserSkill, { foreignKey: "user_id", as: "UserSkills" });
    User.hasMany(models.QuizSkillLoadout, {
      foreignKey: "user_id",
      as: "QuizSkillLoadouts",
    });
    User.hasMany(models.SkillUsageHistory, {
      foreignKey: "user_id",
      as: "SkillUsageHistory",
    });
    User.hasMany(models.SkillUsageHistory, {
      foreignKey: "target_user_id",
      as: "TargetedSkillUsage",
    });
    User.hasMany(models.ActiveSkillEffect, {
      foreignKey: "affected_user_id",
      as: "ActiveSkillEffects",
    });
    User.hasMany(models.ActiveSkillEffect, {
      foreignKey: "caster_user_id",
      as: "CastedSkillEffects",
    });
    ```

2.  **`models/quiz.js`**:

    - Trong hàm `init`, xóa các trường liên quan đến skill:

    ```javascript
    // Xóa các trường sau trong hàm init() của file: backend/src/models/quiz.js
    skill_system_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether skill system is enabled for this quiz'
    },
    ```

#### **2.2. Cập nhật Services**

1.  **`services/quizRacingService.js`**: Đây là file bị ảnh hưởng nhiều nhất. Bạn cần đơn giản hóa nó.

    - **Xóa các phương thức:**
      - `loadParticipantSkills`
      - `updatePlayerEnergy`
      - `selectRandomSkill`
      - `executeSkillInRacing` (và tất cả các hàm con `execute...Skill`)
      - `applyActiveEffect`
      - `removeAllDebuffs`
    - **Cập nhật `initializeQuizRacing`**: Loại bỏ các thuộc tính liên quan đến skill khỏi đối tượng `participant`.

    **Trước khi sửa:**

    ```javascript
    // ...
    participants: participants.map((p) => ({
      // ...
      energy_percent: 0,
      skills_used: [],
      active_effects: [],
      loadout: null,
    })),
    // ...
    ```

    **Sau khi sửa:**

    ```javascript
    // trong file: backend/src/services/quizRacingService.js
    // ... trong hàm initializeQuizRacing
    participants: participants.map((p) => ({
      user_id: p.user_id,
      username: p.username,
      current_score: 0,
      current_streak: 0,
      position: 0,
    })),
    // ...
    ```

    - **Cập nhật `handleSubmitRacingAnswer`**: Xóa logic gọi đến `updatePlayerEnergy`.

2.  **`services/obstacleRacingService.js`**:
    - Vì service này kế thừa từ `quizRacingService`, các phương thức liên quan đến skill đã tự động bị loại bỏ. Bạn chỉ cần kiểm tra xem có lời gọi trực tiếp nào đến các phương thức đã xóa hay không và loại bỏ chúng.

#### **2.3. Cập nhật Controllers**

1.  **`controllers/quizRacingController.js`**:

    - Trong `setupSocketEvents`, xóa các trình xử lý sự kiện (socket handlers) sau:
      - `socket.on('use-skill', ...)`
      - `socket.on('get-random-skill', ...)`
    - Trong `handleSubmitRacingAnswer`, xóa logic gọi đến `updatePlayerEnergy`.

2.  **`controllers/quizController.js`**:

    - Trong `createQuiz` và `updateQuiz`, xóa `skill_system_enabled` khỏi danh sách các trường được trích xuất từ `req.body` và khỏi đối tượng `clonedQuizData` (nếu có).

    ```javascript
    // Ví dụ trong createQuizWithMode
    const modeConfig = {
      quiz_mode: quiz_mode,
      gamification_enabled: quiz_mode === "practice",
      // Xóa dòng skill_system_enabled
      avatar_system_enabled: quiz_mode === "practice",
      // ...
    };
    ```

---

### **Bước 3: Cập nhật Database (Migration)**

Đây là bước quan trọng để xóa các bảng và cột không còn cần thiết khỏi cơ sở dữ liệu của bạn.

**1. Tạo file migration mới:**

Chạy lệnh sau trong terminal của bạn:

```bash
npx sequelize-cli migration:generate --name remove-skill-system
```

**2. Chỉnh sửa file migration vừa tạo (`YYYYMMDDHHMMSS-remove-skill-system.js`):**

Dán đoạn mã sau vào hàm `up`. Hàm `down` có thể để trống vì việc khôi phục lại hệ thống này rất phức tạp.

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      console.log("Starting to remove the skill system...");

      // 1. Drop tables with foreign keys first
      console.log(
        "Dropping ActiveSkillEffect, SkillUsageHistory, QuizSkillLoadout, UserSkill tables..."
      );
      await queryInterface.dropTable("ActiveSkillEffects", { transaction });
      await queryInterface.dropTable("SkillUsageHistory", { transaction });
      await queryInterface.dropTable("QuizSkillLoadouts", { transaction });
      await queryInterface.dropTable("UserSkills", { transaction });

      // 2. Drop the main Skill table
      console.log("Dropping Skills table...");
      await queryInterface.dropTable("Skills", { transaction });

      // 3. Remove skill-related columns from the Quizzes table
      console.log("Removing skill-related columns from Quizzes table...");
      await queryInterface.removeColumn("Quizzes", "skill_system_enabled", {
        transaction,
      });

      // Bạn có thể giữ lại các cột gamification khác hoặc xóa nếu muốn đơn giản hóa hơn nữa
      // Ví dụ, nếu bạn không cần các cờ enable riêng lẻ nữa:
      // await queryInterface.removeColumn('Quizzes', 'avatar_system_enabled', { transaction });
      // await queryInterface.removeColumn('Quizzes', 'level_progression_enabled', { transaction });
      // await queryInterface.removeColumn('Quizzes', 'real_time_leaderboard_enabled', { transaction });

      console.log("Skill system removed successfully from the database.");
    });
  },

  async down(queryInterface, Sequelize) {
    // Việc khôi phục lại hệ thống skill rất phức tạp.
    // Nên restore từ backup thay vì chạy 'down'.
    console.log(
      "Rolling back this migration is not supported. Please restore from a database backup if needed."
    );
    throw new Error("Rollback for skill system removal is not supported.");
  },
};
```

**3. Chạy migration:**

```bash
npx sequelize-cli db:migrate
```

Lệnh này sẽ thực thi hàm `up` và xóa các bảng/cột liên quan đến hệ thống skill khỏi cơ sở dữ liệu của bạn.

---

### **Tổng kết và các bước tiếp theo**

Sau khi hoàn thành các bước trên:

1.  **Hệ thống Skill đã được loại bỏ hoàn toàn** khỏi mã nguồn và cơ sở dữ liệu.
2.  **Chế độ Quiz Racing** giờ đây sẽ đơn giản hơn, chỉ tập trung vào việc trả lời câu hỏi nhanh và chính xác để tích điểm. Logic về `energy` cũng đã được loại bỏ.
3.  **Mã nguồn của bạn đã gọn gàng hơn**, giảm bớt sự phức tạp và dễ bảo trì.

**Các bước tiếp theo:**

- **Kiểm tra toàn diện (Testing):** Chạy lại các luồng liên quan đến Quiz Racing. Đảm bảo rằng việc tạo quiz, tham gia, trả lời câu hỏi, và xem bảng xếp hạng vẫn hoạt động bình thường mà không có lỗi liên quan đến skill.
- **Cập nhật Frontend:** Xóa tất cả các giao diện người dùng liên quan đến việc chọn, trang bị, và sử dụng skill. Giao diện trong game của Quiz Racing cũng cần được cập nhật để loại bỏ thanh năng lượng và nút kích hoạt kỹ năng.
- **Dọn dẹp Seed Data:** Nếu bạn có các file seed để tạo dữ liệu mẫu cho `Skill`, `UserSkill`, v.v., hãy xóa chúng.
