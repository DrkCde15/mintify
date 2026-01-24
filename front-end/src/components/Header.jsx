import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn, UserPlus, LogOut, LayoutDashboard, Store } from 'lucide-react';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userData = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (token && userData.nome) {
            setIsLoggedIn(true);
            setUserName(userData.nome);
        } else {
            setIsLoggedIn(false);
            setUserName('');
        }
    }, []); // Check login status on component mount

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setUserName('');
        navigate('/login'); // Redirect to login page after logout
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    return (
        <header className="app-header">
            <div className="header-left">
                <Link to="/" className="header-logo">Mintify</Link>
            </div>
            <div className="header-right">
                <div className="profile-menu" ref={dropdownRef}>
                    <User size={32} className="profile-icon" onClick={toggleDropdown} />

                    {isDropdownOpen && (
                        <div className="dropdown-content">
                            {isLoggedIn ? (
                                <>
                                    <span className="dropdown-item-text">Olá, {userName}!</span>
                                    <Link to="/app" className="dropdown-item" onClick={toggleDropdown}>
                                        <LayoutDashboard size={18} /> Meu Painel
                                    </Link>
                                    <button onClick={handleLogout} className="dropdown-item">
                                        <LogOut size={18} /> Sair
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="dropdown-item" onClick={toggleDropdown}>
                                        <LogIn size={18} /> Entrar
                                    </Link>
                                    <Link to="/cadastro" className="dropdown-item" onClick={toggleDropdown}>
                                        <UserPlus size={18} /> Cadastrar
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;