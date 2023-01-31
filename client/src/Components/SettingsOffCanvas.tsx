import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useReducer, useState } from "react";
import { Button, Col, Container, Form, Modal, Offcanvas, Row } from "react-bootstrap";
import { atom, RecoilValue, useRecoilState } from "recoil";
import { recoilPersist } from "recoil-persist";
import { useToasts } from "./Contexts/ToastContext";
import PasswordInput from "./PasswordInput";

type SettingsOffCanvasProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

type AppSettings = {
  awsAccessKeyId: string;
  awsAccessKeySecret: string;
  awsRegion: string;
  template: string;
  rawParameterStoreAllowedPrefixes: string;
  rawParameterStoreHiddenPatterns: string;
};

type AppSettingsContainer = {
  profileNames: string[];
  allAppSettings: Record<string, AppSettings>;
}

const { persistAtom } = recoilPersist();

const appSettingsState = atom<AppSettingsContainer>({
  key: 'allAppSettings',
  default: { 
    profileNames: ['default'], 
    allAppSettings: { 
      "default": {} as Required<AppSettings>
    }
  } as AppSettingsContainer,
  effects_UNSTABLE: [persistAtom],
});

type FormControlElement = HTMLInputElement | HTMLTextAreaElement;

function SettingsOffCanvas({show, setShow} : SettingsOffCanvasProps) {
  console.log('localstorage', window.localStorage);
  const [appSettingsContainer, setAppSettingsContainer] = useRecoilState(appSettingsState); 
  const [currentProfile, setCurrentProfile] = useState('default');
  const [currentAppSettings, setCurrentAppSettings] = useState(appSettingsContainer.allAppSettings[currentProfile]); 

  const [showAddProfileModal, setShowAddProfileModal] = useState(false); 
  
  const handleClose = () => setShow(false);

  useEffect(() => {
    const container = {
      allAppSettings: { ...appSettingsContainer.allAppSettings },
      profileNames: [...appSettingsContainer.profileNames]
    } as AppSettingsContainer;
    container.allAppSettings[currentProfile] = {...currentAppSettings};
    setAppSettingsContainer(container);
  }, [currentAppSettings])

  useEffect(() => {
    setCurrentAppSettings(appSettingsContainer.allAppSettings[currentProfile] ?? {} as Required<AppSettings>);
  }, [currentProfile]);

  const setSelectedProfile = (name: string) => {
    setCurrentProfile(name);
  }

  return(<>
    <Offcanvas show={show} onHide={handleClose} placement="start">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Settings</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Row className="mb-2">
          <Col xs="auto">
            <div><strong>Settings Profile</strong></div>
            <select value={currentProfile} onChange={e => setSelectedProfile(e.target.value)} className="form-control">
              {appSettingsContainer.profileNames.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </Col>
          <Col> 
            <Button onClick={_ => setShowAddProfileModal(true)} variant="success" className="mt-3"><FontAwesomeIcon icon={faAdd} /></Button>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col> 
            <div><strong>AWS Access Key Id</strong></div>
            <PasswordInput id="awsKey" placeholder="Access Key Id" value={currentAppSettings.awsAccessKeyId ?? ''} onChange={(e: React.ChangeEvent<FormControlElement>) => setCurrentAppSettings({...currentAppSettings, awsAccessKeyId: e.target.value})} />
          </Col>
        </Row>
        <Row className="mb-2">
          <Col>
            <div><strong>AWS Access Key Secret</strong></div>
            <PasswordInput id="awsSecret" placeholder="Access Key Secret" value={currentAppSettings.awsAccessKeySecret ?? ''} onChange={(e: React.ChangeEvent<FormControlElement>) => setCurrentAppSettings({...currentAppSettings, awsAccessKeySecret: e.target.value})} />
          </Col>
        </Row>
        <Row className="mb-2">
          <Col>
            <div><strong>AWS Region</strong></div>
            <Form.Control id="awsRegion" placeholder="Region" value={currentAppSettings.awsRegion ?? ''} onChange={e => setCurrentAppSettings({...currentAppSettings, awsRegion: e.target.value})} />
          </Col>
        </Row>
        <Row className="mb-2">
          <Col>
            <div><strong>Template</strong></div>
            <Form.Control id="template" placeholder="Template" value={currentAppSettings.template ?? ''} onChange={e => setCurrentAppSettings({...currentAppSettings, template: e.target.value})} />
          </Col>
        </Row>
        <Row className="mb-2">
          <Col>
            <div><strong>Allowed Prefixes</strong></div>
            <Form.Control id="allowedPrefixes" placeholder="Allowed Prefixes" value={currentAppSettings.rawParameterStoreAllowedPrefixes ?? ''} onChange={e => setCurrentAppSettings({...currentAppSettings, rawParameterStoreAllowedPrefixes: e.target.value})} />
          </Col>
        </Row>
        <Row className="mb-2">
          <Col>
            <div><strong>Hidden Patterns</strong></div>
            <Form.Control id="hiddenPatterns" placeholder="Hidden Patterns" value={currentAppSettings.rawParameterStoreHiddenPatterns ?? ''} onChange={e => setCurrentAppSettings({...currentAppSettings, rawParameterStoreHiddenPatterns: e.target.value})} />
          </Col>
        </Row>
      </Offcanvas.Body>
    </Offcanvas>
    <AddSettingsProfileModal show={showAddProfileModal} setShow={setShowAddProfileModal} setSelectedProfile={setSelectedProfile} />
  </>);
}

type AddSettingsProfileModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProfile: (name: string) => void;
};

function AddSettingsProfileModal({ show, setShow, setSelectedProfile } : AddSettingsProfileModalProps) {
  const handleClose = () => setShow(false);

  const { addToast } = useToasts();
  const [appSettingsContainer, setAppSettingsContainer] = useRecoilState(appSettingsState);
  const [name, setName] = useState('');

  const addNewProfile = () => {
    var existingProfile = appSettingsContainer.profileNames.find(x => x == name);
    if(existingProfile){
      addToast({ message: 'Error: profile already exists!', textColor: 'danger' });
    } else {
      const container = {
        allAppSettings: { ...appSettingsContainer.allAppSettings },
        profileNames: [...appSettingsContainer.profileNames]
      } as AppSettingsContainer; 
      container.profileNames = [...container.profileNames, name];
      setAppSettingsContainer(container);
      setSelectedProfile(name);
      setName('');
      handleClose();      
    }
  }

  return (<>
    <Modal show={show} onHide={handleClose} size='sm' centered>
      <Modal.Header closeButton>
          <Row className='justify-content-md-center'>
            <Col><strong>Add settings profile</strong></Col>
          </Row>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col xs="auto">
              <div><strong>Profile Name</strong></div>
              <Form.Control id="profileName" placeholder="Profile Name" value={name} onChange={e => setName(e.target.value)} />
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={addNewProfile}>
          Add new profile
        </Button>
      </Modal.Footer>
    </Modal>
  </>)
}

export default SettingsOffCanvas;