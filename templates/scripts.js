
module.exports = items => `
<script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>

  ${items.map((item) => {
    return `<script src="/services/${item}.js"></script>`;
  }).join('\n')}

  <script>
    ${items.map((item) => {
      return `ReactDOM.hydrate(
        React.createElement(${item}),
        document.getElementById('${item}')
      );`;
  }).join('\n')}
  </script>
`;
