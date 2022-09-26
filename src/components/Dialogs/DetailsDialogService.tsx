import React from 'react';
import ReactDOM from 'react-dom';

const confirmRoot = document.createElement('div');
const body = document.querySelector('body');
body?.appendChild(confirmRoot);

const DetailsDialogService = (DialogContent: (props: { closeHandler: () => void }) => React.ReactElement) => {
  ReactDOM.render(<DialogContent closeHandler={() => ReactDOM.unmountComponentAtNode(confirmRoot)} />, confirmRoot);
};

export default DetailsDialogService;
