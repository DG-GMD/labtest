# Laboratory Testing Application
SSKU lab app

## Docs
- [Project Planning.txt](howToMake.txt)
## Project Implementation Overview
```
main project
└─── Android alarm
└─── iOS alarm
```

### Android Alarm
- Require System Permission.
- Background alarm process is always running on system.
### iOS Alarm
- Require GPS Permission.
- iOS doesn't support running code on suspended state. So application should always running on foreground or background state.