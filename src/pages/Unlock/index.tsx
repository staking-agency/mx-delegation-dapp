import React, { FC, useEffect } from 'react';

import { useGetAccountInfo, DappUI } from '@elrondnetwork/dapp-core';
import { useNavigate } from 'react-router-dom';

import Extension from 'assets/Extension';
import Ledger from 'assets/Ledger';
import Logo from 'assets/Logo';
import Maiar from 'assets/Maiar';

import { network } from 'config';
import TitanStakeLogoBig from '../../assets/TitanStakeLogoBig';

import styles from './styles.module.scss';

interface ConnectionType {
  title: string;
  name: string;
  background: string;
  icon: any;
  component: any;
}

const Unlock: FC = () => {
  const { address } = useGetAccountInfo();

  const navigate = useNavigate();
  const connects: Array<ConnectionType> = [
    {
      title: 'Desktop',
      name: 'Elrond Web Wallet',
      background: '#2647cf',
      icon: Logo,
      component: DappUI.WebWalletLoginButton
    },
    {
      title: 'Hardware',
      name: 'Ledger',
      background: '#2647cf',
      icon: Ledger,
      component: DappUI.LedgerLoginButton
    },
    {
      title: 'Mobile',
      name: 'Maiar App',
      background: 'linear-gradient(225deg, #2C58DA 0%, #1A2ABA 100%)',
      icon: Maiar,
      component: DappUI.WalletConnectLoginButton
    },
    {
      title: 'Browser',
      name: 'Maiar DeFi Wallet',
      background: 'linear-gradient(225deg, #2C58DA 0%, #1A2ABA 100%)',
      icon: Extension,
      component: DappUI.ExtensionLoginButton
    }
  ];

  const redirectConditionally = () => {
    if (Boolean(address)) {
      navigate('/dashboard');
    }
  };

  useEffect(redirectConditionally, [address]);

  return (
    <div>
      <div className={styles.firstlogo}>
        <TitanStakeLogoBig />
      </div>
      <div className={styles.unlock}>
        <div className={styles.wrapper}>
          <div className={styles.logo}>
            <Logo />
          </div>

          <strong className={styles.heading}>
            Titan Stake Delegation Manager
          </strong>

          <div className={styles.description}>
            {`Delegate Elrond (${network.egldLabel}) and earn up to 15% APY!`}
          </div>

          <div className={styles.connects}>
            {connects.map((connect: ConnectionType) => (
              <connect.component
                key={connect.name}
                callbackRoute='/dashboard'
                logoutRoute='/unlock'
              >
                <span className={styles.connect}>
                  <span className={styles.title}>{connect.title}</span>

                  <span
                    className={styles.icon}
                    style={{ background: connect.background }}
                  >
                    <connect.icon />
                  </span>

                  <span className={styles.name}>{connect.name}</span>
                </span>
              </connect.component>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unlock;
