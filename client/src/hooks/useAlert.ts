import useAlertStore from "../stores/alertStore";

const useAlert = () => {
  const { showAlert, hideAlert } = useAlertStore();
  return { showAlert, hideAlert };
};

export default useAlert;