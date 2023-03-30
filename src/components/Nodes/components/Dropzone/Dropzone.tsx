import React, { useState, useEffect } from 'react';

import { faKey, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BLS } from '@multiversx/sdk-wallet';
import axios from 'axios';
import classNames from 'classnames';
import { useFormikContext, FormikProps } from 'formik';
import moment from 'moment';
import { useDropzone } from 'react-dropzone';

import { network } from 'config';

import decodeFile from './helpers';

import styles from './styles.module.scss';
export interface DropzoneFormType {
  files: any[];
}

export interface DropzonePayloadType {
  key: string;
  name: string;
  signature: string;
  pubKey: string;
  value: Uint8Array[];
  errors?: string[];
}

export const Dropzone = () => {
  const [data, setData] = useState<DropzonePayloadType[]>([]);
  const { setFieldValue, values }: FormikProps<DropzoneFormType> =
    useFormikContext();

  const readFile = (file: any) =>
    new Promise((resolve) => {
      const fileReader: any = new FileReader();
      const defaults = {
        name: file.name,
        key: `${file.name}-${moment().unix()}`
      };

      fileReader.onload = () => {
        try {
          const result = fileReader.result;
          const contract = network.delegationContract;
          const decoded = decodeFile(result, contract);

          resolve({
            ...decoded,
            ...defaults
          });
        } catch (error) {
          resolve(defaults);
        }
      };

      fileReader.onError = () => {
        resolve(defaults);
      };

      fileReader.readAsText(file);
    });

  const dropzone = useDropzone({
    multiple: true,
    accept: '.pem',
    onDrop: async (files: any) => {
      try {
        await BLS.initIfNecessary();

        const readers = files.map(readFile);
        const items = await Promise.all(readers);

        setData((previous: any) => [...previous, ...items]);
      } catch (error) {
        console.error(error);
      }
    }
  });

  const properties = {
    input: dropzone.getInputProps(),
    root: dropzone.getRootProps({
      className: classNames(
        styles.dropzone,
        { [styles.fileld]: values.files.length > 0 },
        'dropzone'
      ),
      style: {
        cursor: 'pointer'
      }
    })
  };

  const onRemove = (key: string) => {
    const filter = (item: DropzonePayloadType) => item.key !== key;

    setData((current: DropzonePayloadType[]) => current.filter(filter));
    setFieldValue('files', values.files.filter(filter));
  };

  const setValue = () => {
    const fetchNodes = async () => {
      const value = await Promise.all(
        data.map(async (file: DropzonePayloadType, fileIndex: number) => {
          const errors: string[] = [];
          const duplicate = (item: DropzonePayloadType, itemIndex: number) =>
            file.pubKey === item.pubKey && fileIndex > itemIndex;

          if (!file.pubKey || file.pubKey.length !== 192) {
            errors.push('length');
          }

          if (data.find(duplicate)) {
            errors.push('unique');
          }

          try {
            const existing = await axios.get(
              `${network.apiAddress}/nodes/${file.pubKey}`
            );

            if (existing) {
              errors.push('existing');
            }
          } catch (error) {
            return {
              ...file,
              errors
            };
          }

          return {
            ...file,
            errors
          };
        })
      );

      setFieldValue('files', value);
    };

    fetchNodes();

    return () => setFieldValue('files', []);
  };

  useEffect(setValue, [data]);

  return (
    <div {...properties.root}>
      <input {...properties.input} />

      {values.files.length > 0 ? (
        values.files.map((file: DropzonePayloadType) => (
          <div
            key={file.key}
            className={classNames(styles.file, {
              [styles.error]: file.errors && file.errors.length > 0
            })}
          >
            <div className={styles.meta}>
              <FontAwesomeIcon icon={faKey} />

              <span className={styles.name}>{file.name}</span>
            </div>

            <span
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemove(file.key);
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </span>
          </div>
        ))
      ) : (
        <span className={styles.message}>
          Drag and drop your PEM Files here, or Select Files
        </span>
      )}
    </div>
  );
};
