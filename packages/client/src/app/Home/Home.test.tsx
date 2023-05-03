import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from './Home';

describe('Home', () => {
    it('renders homepage', () => {
        
        const home  = render(
            <BrowserRouter>
                <Home/>
            </BrowserRouter>
        );
        const h1 = screen.getByRole("heading", { level: 1 });

        expect(home).toBeTruthy();
        expect(h1).toBeInTheDocument();
        expect(h1.textContent).toEqual('Brewica')

    });
});
