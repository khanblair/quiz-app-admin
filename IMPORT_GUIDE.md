# Import Guide - Bulk Data Import

## 📦 Importing Categories and Quizzes from JSON

The Quiz Admin Dashboard supports bulk importing of both categories and quizzes from JSON files. This is perfect for quickly populating your database with lots of content.

## 📁 Sample Files

Sample JSON files are provided in the `public` folder:
- `public/sample-categories.json` - 10 pre-configured categories
- `public/sample-quizzes.json` - 3 sample quizzes with questions

You can use these as templates for your own imports!

## 🏷️ Importing Categories

### Step 1: Prepare Your JSON File

Create a JSON file with an array of category objects:

```json
[
  {
    "name": "Science",
    "slug": "science",
    "description": "Scientific topics including physics, chemistry, and biology",
    "icon": "🔬",
    "color": "#6366f1"
  },
  {
    "name": "Mathematics",
    "slug": "mathematics",
    "description": "Math problems and mathematical concepts",
    "icon": "📐",
    "color": "#8b5cf6"
  }
]
```

### Required Fields:
- `name` (string) - Category display name
- `slug` (string) - URL-friendly identifier (unique)

### Optional Fields:
- `description` (string) - Category description
- `icon` (string) - Emoji or icon character
- `color` (string) - Hex color code (e.g., "#6366f1")

### Step 2: Import in Dashboard

1. Go to **Dashboard > Categories**
2. Click **"Import JSON"** button
3. Select your JSON file
4. Wait for confirmation

The system will:
- ✅ Validate the JSON format
- ✅ Check for duplicate slugs
- ✅ Create all valid categories
- ✅ Report any errors

## 📝 Importing Quizzes

### Step 1: Prepare Your JSON File

Create a JSON file with an array of quiz objects:

```json
[
  {
    "id": "quiz_science_1",
    "title": "Basic Science Quiz",
    "description": "Test your knowledge of basic science concepts",
    "category": "Science",
    "difficulty": "easy",
    "duration": 10,
    "questions": [
      {
        "id": "q1",
        "question": "What is H2O?",
        "options": ["Water", "Hydrogen", "Oxygen", "Carbon Dioxide"],
        "correctAnswer": 0,
        "explanation": "H2O is the chemical formula for water"
      }
    ]
  }
]
```

### Required Quiz Fields:
- `id` (string) - Unique quiz identifier
- `title` (string) - Quiz title
- `description` (string) - Quiz description
- `category` (string) - Category name (must exist)
- `difficulty` (string) - "easy", "medium", or "hard"
- `duration` (number) - Time limit in minutes
- `questions` (array) - Array of question objects

### Required Question Fields:
- `id` (string) - Question identifier
- `question` (string) - The question text
- `options` (array) - Array of 4 answer options
- `correctAnswer` (number) - Index of correct option (0-3)
- `explanation` (string) - Explanation of correct answer

### Step 2: Import in Dashboard

1. Go to **Dashboard > Quizzes**
2. Click **"Import JSON"** button
3. Select your JSON file
4. Wait for confirmation

The system will:
- ✅ Validate all quizzes
- ✅ Check for duplicate IDs
- ✅ Create all valid quizzes
- ✅ Send notification on success
- ✅ Report total imported

## 🎯 Best Practices

### Category Import Tips:
1. **Use descriptive slugs**: `science` not `sci`
2. **Keep slugs lowercase**: Use hyphens for spaces
3. **Choose distinct colors**: Help users differentiate categories
4. **Add helpful icons**: Emojis work great! 🔬📐📚
5. **Import categories first**: Before importing quizzes

### Quiz Import Tips:
1. **Create categories first**: Quizzes reference category names
2. **Use unique IDs**: Format like `quiz_categoryname_number`
3. **Test with small batches**: Import 1-2 first to verify format
4. **Validate JSON**: Use a JSON validator before importing
5. **Check difficulty levels**: Use only "easy", "medium", or "hard"
6. **Provide explanations**: Help users learn from mistakes

## 📋 JSON Validation

Before importing, validate your JSON:

### Online Validators:
- https://jsonlint.com
- https://jsonformatter.org

### Common Errors:
- ❌ Missing commas between objects
- ❌ Trailing commas in arrays
- ❌ Unescaped quotes in strings
- ❌ Missing required fields
- ❌ Wrong data types (string vs number)

## 🔧 Troubleshooting

### "Invalid JSON format" Error
- Check your JSON syntax
- Ensure it's an array `[...]` not an object `{...}`
- Validate with an online tool

### "Category already exists" Error
- Check for duplicate slugs in your file
- Remove duplicates or use different slugs
- Existing categories won't be re-imported

### "Quiz ID already exists" Error
- Each quiz needs a unique ID
- Change duplicate IDs
- Existing quizzes won't be re-imported

### Import Partially Succeeds
- Some items valid, some invalid
- Check error messages
- Fix invalid items and re-import

## 📊 Example Workflow

### Complete Import Process:

1. **Prepare Categories**
   ```bash
   # Download sample
   curl https://your-app.com/sample-categories.json > my-categories.json
   # Or create your own
   ```

2. **Import Categories**
   - Go to Dashboard > Categories
   - Click "Import JSON"
   - Upload `my-categories.json`
   - Verify success: "Imported 10 categories!"

3. **Prepare Quizzes**
   ```bash
   # Download sample
   curl https://your-app.com/sample-quizzes.json > my-quizzes.json
   # Or create your own
   ```

4. **Import Quizzes**
   - Go to Dashboard > Quizzes
   - Click "Import JSON"
   - Upload `my-quizzes.json`
   - Verify success: "Imported 3 quizzes!"

5. **Verify**
   - Check categories page for new categories
   - Check quizzes page for new quizzes
   - Test a quiz to ensure it works

## 💡 Pro Tips

### Generating IDs
```javascript
// For quiz IDs
`quiz_${category}_${timestamp}_${random}`

// Example:
"quiz_science_1699900000_abc123"
```

### Color Palette
Use consistent colors for similar categories:
- Sciences: Blues/Purples (#6366f1, #8b5cf6)
- Humanities: Pinks/Oranges (#ec4899, #f59e0b)
- Technical: Cyans/Greens (#06b6d4, #10b981)

### Bulk Generation
Use a script to generate many quizzes:
```javascript
const quizzes = categories.map((cat, i) => ({
  id: `quiz_${cat.slug}_${i}`,
  title: `${cat.name} Quiz ${i + 1}`,
  category: cat.name,
  // ... other fields
}));
```

## 📚 Resources

- **Sample Files**: Check `public/sample-*.json`
- **JSON Spec**: https://www.json.org
- **Emoji List**: https://emojipedia.org
- **Color Picker**: https://htmlcolorcodes.com

## ✅ Checklist

Before importing:
- [ ] JSON is valid (checked with validator)
- [ ] All required fields present
- [ ] Categories imported first (for quizzes)
- [ ] IDs are unique
- [ ] Difficulty levels are correct
- [ ] Question options have 4 items
- [ ] CorrectAnswer is 0-3
- [ ] Tested with small sample first

## 🎉 Success!

After successful import:
- ✅ Categories appear in sidebar filters
- ✅ Quizzes show in dashboard
- ✅ Stats update automatically
- ✅ Notification sent to admin
- ✅ Ready to use immediately!

Need help? Check the console for detailed error messages or refer to the main documentation.
