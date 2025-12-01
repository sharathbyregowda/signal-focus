# Export/Import Feature Documentation

## 📦 Data Backup & Restore

The Signal vs. Noise application now includes export/import functionality, allowing you to backup your data and restore it on any device or browser.

---

## 🎯 Features

### Export Data
- **Downloads** all your data as a JSON file
- **Includes**: Tasks, history, settings, streaks
- **Filename**: `signal-focus-backup-YYYY-MM-DD.json`
- **Use case**: Regular backups, switching devices

### Import Data
- **Restores** data from a backup file
- **Validates** file format before importing
- **Replaces** current data with imported data
- **Use case**: Restore on new device, recover from data loss

---

## 📱 How to Use

### Creating a Backup

1. Go to **Settings** tab
2. Scroll to **Data Backup** section
3. Click **📥 Export Data**
4. File downloads automatically: `signal-focus-backup-2025-11-26.json`
5. Save this file somewhere safe (cloud storage, email, etc.)

### Restoring from Backup

1. Go to **Settings** tab
2. Scroll to **Data Backup** section
3. Click **📤 Import Data**
4. Select your backup JSON file
5. ✅ Success message appears
6. All your data is restored!

---

## 🔄 Use Cases

### Switching Devices
```
Phone → Export → Email file → Laptop → Import
```

### Switching Browsers
```
Chrome → Export → Save file → Firefox → Import
```

### Regular Backups
```
Weekly: Export → Save to Google Drive/Dropbox
```

### Sharing Setup
```
Export → Share file → Friend imports → Same settings!
```

---

## 📋 What Gets Backed Up

The backup file includes:

```json
{
  "currentSession": {
    "date": "2025-11-26",
    "tasks": [...],
    "startTime": 1732636800000,
    "completedCount": 3
  },
  "history": [
    {
      "date": "2025-11-25",
      "tasks": [...],
      "completedCount": 4
    }
  ],
  "settings": {
    "wakeTime": "06:00",
    "sleepTime": "22:00",
    "sessionDuration": 18
  }
}
```

**Everything is preserved**:
- ✅ Current day's tasks
- ✅ All historical sessions
- ✅ Task completion status
- ✅ Sleep schedule settings
- ✅ Streaks (calculated from history)

---

## ⚠️ Important Notes

### Data Replacement
- **Import replaces ALL current data**
- Make sure to export current data first if you want to keep it
- No undo after import (unless you have a backup)

### File Validation
- Only accepts valid Signal vs. Noise backup files
- Shows error if file is corrupted or wrong format
- Error message: "Invalid backup file..."

### Privacy
- **Your data never leaves your device** (except when you export)
- Export file is stored locally on your device
- You control where the file goes (cloud, email, etc.)

---

## 🛡️ Best Practices

### Regular Backups
```
✅ Export weekly
✅ Save to cloud storage (Google Drive, Dropbox)
✅ Keep multiple backup versions
✅ Test restore occasionally
```

### Before Major Changes
```
✅ Export before clearing browser data
✅ Export before switching browsers
✅ Export before uninstalling browser
✅ Export before device reset
```

### Multi-Device Workflow
```
1. Use primary device normally
2. Export at end of day
3. Save to cloud storage
4. Import on secondary device when needed
```

---

## 🔧 Technical Details

### File Format
- **Type**: JSON (JavaScript Object Notation)
- **Encoding**: UTF-8
- **Size**: Typically < 100KB (depends on history)
- **Readable**: Yes, can open in text editor

### Validation
The import function validates:
- ✅ Valid JSON format
- ✅ Contains `settings` object
- ✅ Contains `history` array
- ❌ Rejects corrupted files
- ❌ Rejects wrong file types

### Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (Chrome, Safari)

---

## 💡 Tips & Tricks

### Automated Backups
Set a reminder to export weekly:
- Sunday evening: Export data
- Save to cloud storage
- Keeps you protected

### Version Control
Name your backups descriptively:
- `signal-focus-backup-2025-11-26-before-vacation.json`
- `signal-focus-backup-2025-11-26-100-day-streak.json`

### Cross-Platform
Works across all platforms:
- Windows ↔ Mac ↔ Linux
- Desktop ↔ Mobile
- Any browser ↔ Any browser

---

## 🐛 Troubleshooting

### Import Shows Error
**Problem**: "Invalid backup file" error

**Solutions**:
1. Make sure file is a Signal vs. Noise export
2. Check file isn't corrupted (try opening in text editor)
3. Re-export from original device
4. Make sure file extension is `.json`

### Export Doesn't Download
**Problem**: File doesn't download

**Solutions**:
1. Check browser download settings
2. Check browser permissions
3. Try different browser
4. Check disk space

### Data Doesn't Appear After Import
**Problem**: Imported but data not showing

**Solutions**:
1. Refresh the page
2. Check you're on the right tab (Today/History)
3. Verify file contained data (open in text editor)
4. Try importing again

---

## 🎓 Example Workflow

### Scenario: Switching from Phone to Laptop

**On Phone (Chrome)**:
1. Open Signal vs. Noise app
2. Go to Settings → Data Backup
3. Click "Export Data"
4. File downloads: `signal-focus-backup-2025-11-26.json`
5. Email file to yourself

**On Laptop (Firefox)**:
1. Open email, download backup file
2. Open Signal vs. Noise app
3. Go to Settings → Data Backup
4. Click "Import Data"
5. Select downloaded file
6. ✅ All your tasks and history appear!

---

## 🚀 Future Enhancements

Potential future features:
- Automatic cloud sync
- Scheduled auto-exports
- Merge imports (instead of replace)
- Selective import (choose what to restore)
- Export to CSV/PDF formats

---

## 📞 Summary

**Export/Import gives you**:
- ✅ Full control over your data
- ✅ Easy device switching
- ✅ Protection from data loss
- ✅ No cloud dependency
- ✅ Privacy-first approach

**Remember**: Export regularly, store safely, import when needed!
