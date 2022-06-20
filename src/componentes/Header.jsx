import React from 'react';
import FavoritosContext from '../contexts/favoritosContext';
import '../hojas-de-estilo/Header.css';
import Searchbar from './Searchbar';
import Tipos from './Tipos';

const { useContext } = React;

function Header({ ...props }) {

    const {pokemonFavoritos} = useContext(FavoritosContext);

    return(
        <header id='header' className='container'>
            <a className='header-logo' href="https://pokeapi.co/" target="_blank" rel="noreferrer"><img 
                src={require("../imagenes/pokeapi-logo.png")} 
                alt="Logo de PokeApi" 
            /></a>
            <div className='header-favoritos'>
            ❤️️ {pokemonFavoritos.length}
            </div>
            <Searchbar {...props}/>
            <Tipos {...props} />
        </header>
    )
}

export default Header;