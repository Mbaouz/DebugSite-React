import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const DataContext = createContext({});

export const api = {
  loadData: async () => {
    const json = await fetch("/events.json");
    return json.json();
  },
};

export const DataProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [last, setLast] = useState(null); // Déclaration de l'hook pour le dernier événement

  const getData = useCallback(async () => {

    try {
      setData(await api.loadData());

      const loadedData = await api.loadData(); // Je charge les données de l'API et je les stocke temporairement pour vérifier et contrôler leur intégrité.
      // Création d'une variable intermédiaire pour contrôler le contenu de l'API et m'assurer de la présence des données nécessaires.
      // Ce passage me permet, eventuellement, de modifier la structure des données avant de la renvoyer au context
      setData(loadedData);

      // Je crée une copie du tableau d'événements et ensuite je la trie pour obtenir le dernier événement
      const latestEvent = loadedData?.events.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      // avec slice() on "decoupe" loadedData, mais sans arguments, donc il crée la copie de la constante. "trick" ;)
      setLast(latestEvent);
      

    } catch (err) {
      setError(err);
    }
  }, []);
  useEffect(() => {
    if (data) return;
    getData();
  });
  
  return (
    <DataContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        data,
        error,
        last,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useData = () => useContext(DataContext);

export default DataContext;
