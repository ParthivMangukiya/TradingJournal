import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase-client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Container, Content, Panel, FlexboxGrid } from 'rsuite';
import styles from './LoginPage.module.css'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session) {
    navigate('/');
    return null;
  }

  return (
    <Container className={styles.login_page}>
      <Content>
        <FlexboxGrid justify="center" align="middle" style={{ height: '100vh' }}>
          <FlexboxGrid.Item colspan={16}>
            <h1 className={styles.chameleon_title}>Trading Journal</h1>
            <p className={styles.description}>
              Track your trades, analyze your performance, and improve your strategies.
            </p>
            <Panel bordered>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: 'var(--accent)',
                        brandAccent: 'var(--action-primary)',
                        inputBackground: 'var(--primary-dark)',
                        inputText: 'var(--text-primary)',
                        inputPlaceholder: 'var(--text-tertiary)',
                        messageText: 'var(--text-secondary)',
                        messageTextDanger: 'var(--action-danger)',
                      },
                    },
                  },
                }}
                theme="dark"
              />
            </Panel>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Content>
    </Container>
  );
};

export default LoginPage;