export const onUncaughtException = () => {
  process.on('uncaughtException', (e) => {
    console.log(`!!! Uncaught Exception: `, e);
  });
};
export const onUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, p) => {
    console.log(
      `!!! Unhandled Rejection`,
      reason,
      p
        .then((x) => console.log('!!! then: ', x))
        .catch((e) => console.log('!!! catch: ', e)),
    );
  });
};
// отлов ошибок чтоб сервер не падал
export const globalCatch = () => {
  onUncaughtException();
  onUnhandledRejection();
};
