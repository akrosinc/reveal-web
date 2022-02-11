import * as React from 'react';
import * as ReactDOM from 'react-dom';

const confirmRoot = document.createElement('div');
const body = document.querySelector('body');
body?.appendChild(confirmRoot);

const ConfirmDialogService = (
  DialogContent: (props: { giveAnswer: (answer: boolean) => void }) => React.ReactElement
): Promise<boolean> =>
  new Promise(res => {
    const giveAnswer = (answer: boolean) => {
      ReactDOM.unmountComponentAtNode(confirmRoot);
      res(answer);
    };

    ReactDOM.render(<DialogContent giveAnswer={giveAnswer} />, confirmRoot);
  });

export default ConfirmDialogService;
