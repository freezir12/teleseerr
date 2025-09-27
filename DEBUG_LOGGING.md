# Teleseerr V2 - Debug Logging Features

## Enhanced Debug Logging

Dieses Projekt wurde mit umfassenden Debug-Logging-Funktionen erweitert, um TV-Request-Probleme zu diagnostizieren.

### Added Debug Features

#### 1. Detailliertes API-Logging (`fetchFromJellyseerr.ts`)
- 🌐 Vollständige Request-URLs und Parameter
- 📦 Request Body Serialisierung 
- 📡 Response Status und Headers
- 💥 Detaillierte Error-Responses mit JSON-Parsing
- 🔍 Network-Error-Handling

#### 2. Erweiterte Request-Funktion (`jellyseerr.ts`)
- 🎬 TV-Show spezifische Parameter (seasons, serverId, etc.)
- 📺 Automatisches "all seasons" für TV-Requests
- 📊 Response-Analyse für erfolgreiche Requests
- 🚨 Spezialisierte TV-Request-Error-Analyse

#### 3. Advanced Logger (`utils/logger.ts`)
- 📝 Strukturiertes Logging mit Timestamps
- 🔍 Component-basierte Log-Kategorien
- 📋 Context-Informationen als JSON
- 🎯 TV-Request-Analyse mit häufigen Fehlern
- 🔧 Environment-Variable-Validierung

#### 4. Bot Error Handling (`index.ts`)
- 🤖 Startup-Logging mit Konfiguration
- 💥 Unhandled Error-Catching mit Context
- 🎯 Telegram-Command-Logging

### TV Request Debugging

Wenn ein TV-Request fehlschlägt, analysiert das System automatisch:

#### 500 Internal Server Error
- Sonarr-Konfiguration und Erreichbarkeit
- Quality Profile und Root Folder Validierung
- Bereits existierende Serien in Sonarr
- TMDB ID Verfügbarkeit
- Network-Konnektivität

#### 400 Bad Request Error
- Invalid Request Payload
- Fehlende Required Fields
- Ungültige Season-Nummern oder Format

### Log Output Beispiele

#### Successful TV Request
```
🌐 [fetchFromJellyseerr] Starting POST request to: /request
📦 [fetchFromJellyseerr] Request body: {
  "mediaType": "tv",
  "mediaId": 1399,
  "seasons": "all"
}
📡 [fetchFromJellyseerr] Response received - Status: 201 Created
✅ [request] Request successful
📺 TV Request Analysis:
├── Media Type: tv
├── Seasons: all
├── Server ID: undefined
└── Response: {"id": 123, "status": "approved"}
```

#### Failed TV Request with Analysis
```
💥 [fetchFromJellyseerr] Request failed: HTTP 500 Internal Server Error
🔍 Possible causes for 500 error:
   • Sonarr not configured or unreachable
   • Invalid quality profile or root folder  
   • Series already exists in Sonarr
   • TMDB ID not found in Sonarr's series database
   • Network connectivity issues between Overseerr and Sonarr
```

### Usage

Das Debug-Logging ist automatisch aktiviert. Alle Request werden geloggt mit:
- Complete request/response cycle
- Error analysis für TV requests
- Environment validation beim Bot-Start
- Telegram interaction logging

### Configuration Validation

Beim Start validiert der Logger:
- ✅ JELLYSEERR_URL gesetzt
- ✅ JELLYSEERR_KEY gesetzt  
- ✅ BOT_TOKEN gesetzt

### Common TV Request Issues

1. **Sonarr Configuration**: Prüfen Sie Settings → Sonarr in Overseerr
2. **Quality Profiles**: Stellen Sie sicher, dass ein Standard-Profil gesetzt ist
3. **Root Folders**: Validieren Sie die konfigurierten Pfade
4. **Series Lookup**: Prüfen Sie ob die TMDB ID in Sonarr's Serie-Datenbank existiert
5. **Network**: Testen Sie die Verbindung zwischen Overseerr und Sonarr

### Next Steps

Mit diesen Debug-Logs können Sie:
1. Die Console-Ausgabe für TV-Requests analysieren
2. Specific Error-Patterns identifizieren
3. Sonarr/Overseerr Configuration-Issues diagnostizieren
4. Network-Problems zwischen Services aufdecken