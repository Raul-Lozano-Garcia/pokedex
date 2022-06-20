import './App.css';
import Header from './componentes/Header';
import Pokedex from './componentes/Pokedex';
import { useState,useEffect } from 'react';
import { getPokemonData, getPokemons, searchPokemon, searchPokemonPorTipo } from "./api";
import { FavoritosProvider } from './contexts/favoritosContext';
import { ShinysProvider } from './contexts/shinysContext';
import { TraducirProvider } from './contexts/traducirContext';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

function App() {

  const location = useLocation();

  const localStorageKeyFav = 'pokemon_favorito';
  const localStorageKeyShiny = 'pokemon_shiny';

  const [pokemons,setPokemons] = useState([]);
  const [page,setPage] = useState(0);
  const [tipo, setTipo] = useState(location.pathname ? location.pathname.substring(1,location.pathname.length) : "");
  const [total,setTotal] = useState(0);
  const [loading,setLoading] = useState(true);
  const [favoritos,setFavoritos] = useState([]);
  const [shinys,setShinys] = useState([]);
  const [sinResultados,setSinResultados] = useState(false);
  const [buscando,setBuscando] = useState(false);

  useEffect(() => {
    fetchPokemonsPorTipo(tipo)
  }, [tipo]);

  const fetchPokemons = async () =>{
    try {
      setSinResultados(false);
      setBuscando(false);
      setLoading(true)
      const data = await getPokemons(9, 9 * page);
      const promises = data.results.map( async (pokemon) => {
        return(
          await getPokemonData(pokemon.url)
        )
      });
      const results = await Promise.all(promises);
      setPokemons(results);
      setLoading(false);
      setTotal(Math.ceil(data.count / 9));
    } catch (error) {
      
    }
  }

  const cargarPokemonFavoritos = () =>{
    const pokemonsFav = JSON.parse(window.localStorage.getItem(localStorageKeyFav)) || [];
    setFavoritos(pokemonsFav);
  }

  const cargarPokemonShinys = () =>{
    const pokemonsShiny = JSON.parse(window.localStorage.getItem(localStorageKeyShiny)) || [];
    setShinys(pokemonsShiny);
  }

  useEffect(() => {
    cargarPokemonFavoritos();
    cargarPokemonShinys();
  }, []);

  useEffect(() => {
    if(!buscando && !tipo){
      fetchPokemons();
    } 
    }, [page]);

    const actualizarPokemonFavoritos = (url) =>{
      let actualizado = [...favoritos];
      const esFav = actualizado.indexOf(url);
      if(esFav >= 0){
        actualizado.splice(esFav, 1);
      }else{
        actualizado.push(url);
      }
      setFavoritos(actualizado);
      window.localStorage.setItem(localStorageKeyFav, JSON.stringify(actualizado));
    }

    const actualizarPokemonShinys = (nombre) =>{
      let actualizado = [...shinys];
      const esShiny = actualizado.indexOf(nombre);
      if(esShiny >= 0){
        actualizado.splice(esShiny, 1);
      }else{
        actualizado.push(nombre);
      }
      setShinys(actualizado);
      window.localStorage.setItem(localStorageKeyShiny, JSON.stringify(actualizado));
    }

    const nombreTraducido = (nombre) =>{
      let nombreFinal;
      switch (nombre) {
          case "bug":
              nombreFinal="bicho";
              break;
          case "dark":
              nombreFinal="siniestro";
              break;
          case "grass":
              nombreFinal="planta";
              break;
          case "dragon":
              nombreFinal="dragón";
              break;
          case "electric":
              nombreFinal="eléctrico";
              break;
          case "fairy":
              nombreFinal="hada";
              break;
          case "fighting":
              nombreFinal="lucha";
              break;
          case "fire":
              nombreFinal="fuego";
              break;
          case "flying":
              nombreFinal="volador";
              break;
          case "ghost":
              nombreFinal="fantasma";
              break;
          case "ground":
              nombreFinal="tierra";
              break;
          case "ice":
              nombreFinal="hielo";
              break;
          case "normal":
              nombreFinal="normal";
              break;
          case "poison":
              nombreFinal="veneno";
              break;
          case "psychic":
              nombreFinal="psíquico";
              break;
          case "rock":
              nombreFinal="roca";
              break;
          case "steel":
              nombreFinal="acero";
              break;
          case "water":
              nombreFinal="agua";
              break;
          default:
              break;
      }

      return nombreFinal;
  }

    const onSearch = async (pokemon) => {
      if(!pokemon){
        setBuscando(false);
        return fetchPokemons();
      }
      setBuscando(true);
      setLoading(true);
      setSinResultados(false);   
      const result = await searchPokemon(pokemon);
      if(!result){
        setSinResultados(true);
        setLoading(false);
        return;
      }

      setPokemons([result]);
      setLoading(false);
      setPage(0);
      setTotal(1);
    }

    const fetchPokemonsPorTipo = async (tipo) =>{
      try {
        setSinResultados(false);
        setBuscando(true);
        setLoading(true)
        const data = await searchPokemonPorTipo(tipo);
        const promises = data.pokemon.map( async (cadaUno) => {
          return(
            await getPokemonData(cadaUno.pokemon.url)
          )
        });
        const results = await Promise.all(promises);
        setPokemons(results);
        setLoading(false);
        setPage(0);
        setTotal(1);      
      } catch (error) {
        
      }
    }

    const fetchPokemonsFav = async () =>{
      try {
        setSinResultados(false);
        setBuscando(true);
        setLoading(true)
        const promises = favoritos.map( async (cadaUno) => {
          return(
            await getPokemonData(cadaUno)
          )
        });
        const results = await Promise.all(promises);
        setPokemons(results);
        setLoading(false);
        setPage(0);
        setTotal(1);
      } catch (error) {
        
      }
    }

  return (
    <FavoritosProvider value={{
      pokemonFavoritos: favoritos, 
      actualizarPokemonFavoritos: actualizarPokemonFavoritos
    }}>
    <ShinysProvider value={{
      pokemonShinys: shinys, 
      actualizarPokemonShinys: actualizarPokemonShinys
    }}>
    <TraducirProvider value={{
      nombreTraducido: nombreTraducido
    }}>
    <div className="App">
        <Header pokemons={pokemons} onSearch={onSearch} setTipo={setTipo} fetchPokemonsFav={fetchPokemonsFav}/>
        <main id="main" className="container">
          {sinResultados ?
          <h2 className='sin-resultados'>Lo sentimos. El Pokémon introducido no existe. Si desea verlos todos borre su búsqueda</h2>
          :
          <Pokedex 
            loading={loading}
            pokemons={pokemons}
            setPokemons={setPokemons}
            page={page}
            setPage={setPage}
            total={total}
          />
          }
        </main>
    </div>
    </TraducirProvider>
    </ShinysProvider>
    </FavoritosProvider>
  );
}

export default App;
