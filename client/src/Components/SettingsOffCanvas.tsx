import { faAdd, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useState } from "react";
import Environment from "../Data/Environment";
import { AppSettings } from "../Data/Model/AppSettings";
import { AppSettingsContainer, getAppSettingsContainer } from "../Data/Model/AppSettingsContainer";
import { useToasts } from "./Contexts/ToastContext";
import PasswordInput from "./PasswordInput";
import Offcanvas from "./Common/Offcanvas";
import Modal from "./Common/Modal";
import Button from "./Common/Button";
import Select from "./Common/Select";
import Input from "./Common/Input";
import Option from "./Common/Option";
import OverlayTrigger from "./Common/OverlayTrigger";
import { themes } from "../Data/Model/Theme";

type SettingsOffCanvasProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const awsRegions = ['us-east-2', 'us-east-1', 'us-west-1', 'us-west-2',
  'af-south-1', 'ap-east-1', 'ap-south-2', 'ap-southeast-3', 'ap-southeast-4', 'ap-south-1', 'ap-northeast-3', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
  'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-south-1', 'eu-west-3', 'eu-south-2', 'eu-north-1', 'eu-central-2', 'me-south-1', 'me-central-1', 'sa-east-1',
  'us-gov-east-1', 'us-gov-west-1'
];

type FormControlElement = HTMLInputElement | HTMLTextAreaElement;

function SettingsOffCanvas({ show, setShow }: SettingsOffCanvasProps) {
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  const [appSettingsContainer, setAppSettingsContainer] = useState<AppSettingsContainer>(getAppSettingsContainer() as AppSettingsContainer);
  const [currentProfile, setCurrentProfile] = useState(appSettingsContainer.currentProfile);
  const [currentAppSettings, setCurrentAppSettings] = useState(appSettingsContainer.allAppSettings[currentProfile]);

  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [showRemoveProfileModal, setShowRemoveProfileModal] = useState(false);

  const handleClose = () => setShow(false);

  useEffect(() => {
    localStorage.setItem("appSettingsContainer", JSON.stringify(appSettingsContainer));
    Environment.__initialize();
    forceUpdate();
  }, [appSettingsContainer]);

  useEffect(() => {
    const container = {
      allAppSettings: { ...appSettingsContainer.allAppSettings },
      currentProfile: appSettingsContainer.currentProfile,
      profileNames: [...appSettingsContainer.profileNames]
    } as AppSettingsContainer;
    container.allAppSettings[currentProfile] = { ...currentAppSettings };
    container.currentProfile = currentProfile;
    container.profileNames = [...new Set([...container.profileNames, currentProfile])];

    setAppSettingsContainer(container);
  }, [currentAppSettings, currentProfile])

  useEffect(() => {
    setCurrentAppSettings(appSettingsContainer.allAppSettings[currentProfile] ?? {} as Required<AppSettings>);
  }, [currentProfile]);

  const setSelectedProfile = (name: string) => {
    setCurrentProfile(name);
  }

  return <>
    <Offcanvas show={show} onHide={handleClose}>
      <Offcanvas.Header closeButton show={show} setShow={setShow}>
        <Offcanvas.Title>Settings</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="mb-2">
          <div className="flex flex-col gap-1">
            <strong>Settings Profile</strong>
            <div className="flex flex-row items-center gap-3">
              <Select value={currentProfile} onChange={e => setSelectedProfile(e.target.value)} className="w-full">
                {appSettingsContainer.profileNames.map(x => <Option key={x} value={x}>{x}</Option>)}
              </Select>
              <Button onClick={_ => setShowAddProfileModal(true)} variant="success"><FontAwesomeIcon icon={faAdd} /></Button>
              {Object.keys(appSettingsContainer.allAppSettings).length > 1 && <Button onClick={_ => setShowRemoveProfileModal(true)} variant="danger"><FontAwesomeIcon icon={faTrash} /></Button>}
            </div>
          </div>
        </div>
        {currentAppSettings && <div className="flex flex-col gap-3">
          <div>
            <div>Theme</div>
            <Select id="theme" className="w-full" value={currentAppSettings.theme ?? themes[0]?.name} onChange={e => setCurrentAppSettings({ ...currentAppSettings, theme: e.target.value })}>
              {themes.map(x => <Option key={x.name} value={x.name}>{x.name}</Option>)}
            </Select>
          </div>
          <div>
            <div><strong>AWS Access Key Id</strong></div>
            <PasswordInput id="awsKey" placeholder="Access Key Id" value={currentAppSettings.awsAccessKeyId ?? ''} onChange={(e: React.ChangeEvent<FormControlElement>) => setCurrentAppSettings({ ...currentAppSettings, awsAccessKeyId: e.target.value })} />
          </div>
          <div>
            <div><strong>AWS Access Key Secret</strong></div>
            <PasswordInput id="awsSecret" placeholder="Access Key Secret" value={currentAppSettings.awsAccessKeySecret ?? ''} onChange={(e: React.ChangeEvent<FormControlElement>) => setCurrentAppSettings({ ...currentAppSettings, awsAccessKeySecret: e.target.value })} />
          </div>
          <div>
            <div><strong>AWS Region</strong></div>
            <Select id="awsRegion" className="w-full" value={currentAppSettings.awsRegion ?? awsRegions[0]} onChange={e => setCurrentAppSettings({ ...currentAppSettings, awsRegion: e.target.value })}>
              {awsRegions.map(x => <Option key={x} value={x}>{x}</Option>)}
            </Select>
          </div>
          <div>
            <strong>Template</strong>
            <Input id="template" placeholder="Template" className="w-full" value={currentAppSettings.template ?? ''} onChange={e => setCurrentAppSettings({ ...currentAppSettings, template: e.target.value })} />
          </div>
          <div>
            <strong>Allowed Prefixes</strong>
            <OverlayTrigger placement='right' overlay={<>Comma-separated list - Only parameters with these prefixes will be retrieved from parameter store. Useful for environments where access is limited to a subset of all available parameters.</>}>
              <Input id="allowedPrefixes" placeholder="Allowed Prefixes" className="w-full" value={currentAppSettings.rawParameterStoreAllowedPrefixes ?? ''} onChange={e => setCurrentAppSettings({ ...currentAppSettings, rawParameterStoreAllowedPrefixes: e.target.value })} />
            </OverlayTrigger>
          </div>
          <div>
            <strong>Hidden Patterns</strong>
            <OverlayTrigger placement='right' overlay={<>Comma-separated list - Parameter names containing these strings will be hidden by default in lists, not exported to .env files, etc.</>}>
              <Input id="hiddenPatterns" placeholder="Hidden Patterns" className="w-full" value={currentAppSettings.rawParameterStoreHiddenPatterns ?? ''} onChange={e => setCurrentAppSettings({ ...currentAppSettings, rawParameterStoreHiddenPatterns: e.target.value })} />
            </OverlayTrigger>
          </div>
        </div>}
      </Offcanvas.Body>
    </Offcanvas>
    <AddSettingsProfileModal show={showAddProfileModal} setShow={setShowAddProfileModal} setSelectedProfile={setSelectedProfile} initialAppSettingsContainer={appSettingsContainer} />
    <RemoveSettingsProfileModal show={showRemoveProfileModal} setShow={setShowRemoveProfileModal} setSelectedProfile={setSelectedProfile} appSettingsContainer={appSettingsContainer} setAppSettingsContainer={setAppSettingsContainer} profileToRemove={appSettingsContainer.currentProfile} />
  </>;
}

type AddSettingsProfileModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProfile: (name: string) => void;
  initialAppSettingsContainer: AppSettingsContainer;
};

function AddSettingsProfileModal({ show, setShow, setSelectedProfile, initialAppSettingsContainer }: AddSettingsProfileModalProps) {
  const handleClose = () => setShow(false);

  const { addToast } = useToasts();
  const [appSettingsContainer, setAppSettingsContainer] = useState(initialAppSettingsContainer);
  const [name, setName] = useState('');

  const addNewProfile = () => {
    var existingProfile = appSettingsContainer.profileNames.find(x => x === name);
    if (existingProfile) {
      addToast({ message: 'Error: profile already exists!', textColor: 'danger' });
    } else {
      const container = {
        allAppSettings: { ...appSettingsContainer.allAppSettings },
        profileNames: [...appSettingsContainer.profileNames, name]
      } as AppSettingsContainer;
      setAppSettingsContainer(container);
      setSelectedProfile(name);
      setName('');
      handleClose();
    }
  }

  return <Modal show={show} onHide={handleClose} centered>
    <Modal.Header closeButton>
      <div className='justify-content-md-center'>
        <div><strong>Add settings profile</strong></div>
      </div>
    </Modal.Header>
    <Modal.Body>
      <div>
        <div>
          <div>
            <div><strong>Profile Name</strong></div>
            <Input id="profileName" placeholder="Profile Name" value={name} onChange={e => setName(e.target.value)} />
          </div>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="danger" onClick={handleClose}>Cancel</Button>
      <Button variant="success" onClick={addNewProfile}>Add new profile</Button>
    </Modal.Footer>
  </Modal>
}

type RemoveSettingsProfileModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProfile: (name: string) => void;
  appSettingsContainer: AppSettingsContainer;
  setAppSettingsContainer: (container: AppSettingsContainer) => void;
  profileToRemove: string;
};

function RemoveSettingsProfileModal({ show, setShow, setSelectedProfile, appSettingsContainer, setAppSettingsContainer, profileToRemove }: RemoveSettingsProfileModalProps) {
  const handleClose = () => setShow(false);

  const { addToast } = useToasts();
  const [name, setName] = useState('');

  const removeProfile = () => {
    var existingProfile = appSettingsContainer.profileNames.find(x => x === name);
    if (!existingProfile) {
      addToast({ message: 'Error: profile not found!', textColor: 'danger' });
    }
    else if (name !== profileToRemove) {
      addToast({ message: `Error: name doesn't match "${profileToRemove}!`, textColor: 'danger' });
    }
    else {
      delete appSettingsContainer.allAppSettings[profileToRemove];
      const container = {
        allAppSettings: { ...appSettingsContainer.allAppSettings },
        profileNames: [...appSettingsContainer.profileNames.filter(x => x !== profileToRemove)]
      } as AppSettingsContainer;
      setAppSettingsContainer(container);
      setSelectedProfile(Object.keys(appSettingsContainer.allAppSettings)[0]);
      setName('');
      handleClose();
    }
  }

  return <Modal show={show} onHide={handleClose} centered>
    <Modal.Header closeButton>
      <div className='justify-content-md-center'>
        <div><strong>Remove settings profile</strong></div>
      </div>
    </Modal.Header>
    <Modal.Body>
      <div>
        <div>
          <div>
            <div><strong>Profile Name</strong></div>
            <Input id="profileName" placeholder={profileToRemove} value={name} onChange={e => setName(e.target.value)} />
            <div>Type the name of the profile ({profileToRemove}) to permanently remove this profile.</div>
          </div>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="danger" onClick={handleClose}>Cancel</Button>
      <Button variant="success" onClick={removeProfile}>Remove profile</Button>
    </Modal.Footer>
  </Modal>
}


export default SettingsOffCanvas;
