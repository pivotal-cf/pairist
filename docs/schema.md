
```javascript
const schema = {
  team: {
    "{teamName}": {
      people: [
        {
          .key: "<generated>",
          name: "<name>",
          picture: "<url>",
          location: "(available|out|lane)",
        }
      ],
      roles: [
        {
          .key: "<generated>",
          name: "<name>",
          picture: "<url>",
          location: "(available|out|lane)",
        }
      ],
      tracks: [
        {
          .key: "<generated>",
          title: "<title>",
          location: "(available|out|lane)",
        },
      ],
      lanes: [
        {
          sortOrder: 0,
        }
      ]
    },
  },
  history: {
    "{teamName}": [
      { date: Date(), ...snapshot }
    ],
  },
}
```

