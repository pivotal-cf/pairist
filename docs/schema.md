
```javascript
const schema = {
  team: {
    "{teamName}": {
      people: [
        {
          .key: "<generated>",
          name: "<name>",
          picture: "<url>",
          state: "(available|out|track)",
          location: "<.key>",
        }
      ],
      roles: [
        {
          .key: "<generated>",
          name: "<name>",
          picture: "<url>",
          state: "(available|out|track)",
          location: "<.key>",
        }
      ],
      tracks: [
        {
          .key: "<generated>",
          title: "<title>",
        },
      ],
      history: {
        Date(): [
          {
            track: "<.key>",
            people: [...keys],
            roles: [...keys],
          }...
        ],
      },
    },
  },
}
```
