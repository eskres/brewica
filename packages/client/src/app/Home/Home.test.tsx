import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './Home';

describe('Home', () => {
    it('renders homepage', () => {
        
        const home  = render(<Home/>);
        const h1 = screen.getByRole("heading", { level: 1 });

        expect(home).toBeTruthy();
        expect(h1).toBeInTheDocument();
        expect(h1.textContent).toEqual('Brewica')

    });
});
