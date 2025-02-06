import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { deviceTypeLabels, getDeviceType, mockDevices, RhombusDevice } from "./devices";
import registerDevice, { RegisterDevice } from "./registerDevice";
import classes from "./App.module.css";
import { FaVideo, FaMicrophone, FaTemperatureHigh, FaSpinner } from "react-icons/fa";

const groupDevicesByType = (devices: RhombusDevice[]) => {
  return devices.reduce<Record<string, RhombusDevice[]>>((acc, device) => {
    acc[device.deviceType] = acc[device.deviceType] || [];
    acc[device.deviceType].push(device);
    return acc;
  }, {});
};

const App = () => {
  const [devices, setDevices] = useState<RhombusDevice[]>(mockDevices);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<RegisterDevice>({
    defaultValues: {
      name: "",
      serialNumber: "",
      deviceType: "CAMERA",
    },
  });

  const onSubmit: SubmitHandler<RegisterDevice> = async (data) => {
    setFormSuccess(null);
    try {
      const response = await registerDevice(data);
      const newDeviceInput = { ...data, id: response.deviceId };
      const newDevice = getDeviceType(newDeviceInput);
      setDevices((prevDevices) => [...prevDevices, newDevice]);
      reset();
      setFormError(null);
      setFormSuccess("Device added successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) setFormError(error.message);
      else setFormError("An unexpected error occurred");
    }
  };

  return (
    <div className={classes.app}>
      <div className={classes.mainContent}>
        {/* Devices Section */}
        <section className={classes.deviceSection}>
          <div className={classes.deviceGroups}>
            {Object.entries(groupDevicesByType(devices)).map(([type, devices]) => (
              <div key={type} className={classes.deviceGroup}>
                <h3 className={classes.deviceHeader}>
                  {type === "CAMERA" && <FaVideo className={classes.icon} />}
                  {type === "AUDIO_GATEWAY" && <FaMicrophone className={classes.icon} />}
                  {type === "ENVIRONMENTAL_SENSOR" && <FaTemperatureHigh className={classes.icon} />}
                  {deviceTypeLabels[type] || type}
                </h3>
                <div className={classes.deviceGrid}>
                  {devices.map((device) => (
                    <div key={device.id} className={classes.deviceCard}>
                      <h4>{device.name}</h4>
                      <p><strong>Serial:</strong> {device.serialNumber}</p>
                      {device.deviceType === "CAMERA" && (
                        <>
                          <p><strong>Bitrate:</strong> {device.maxBitrate} kbps</p>
                          <p><strong>Model:</strong> {device.hardwareType}</p>
                          {device.disconnected && <p className={classes.warning}>Disconnected</p>}
                        </>
                      )}
                      {device.deviceType === "AUDIO_GATEWAY" && (
                        <>
                          <p><strong>Microphone:</strong> {device.microphoneEnabled ? "On" : "Off"}</p>
                          <p><strong>Speaker:</strong> {device.speakerEnabled ? "On" : "Off"}</p>
                          {device.disconnected && <p className={classes.warning}>Disconnected</p>}
                        </>
                      )}
                      {device.deviceType === "ENVIRONMENTAL_SENSOR" && (
                        <>
                          <p><strong>Temperature:</strong> {device.temperatureCelsius}°C</p>
                          <p><strong>Humidity:</strong> {device.humidityPermyriad / 100}%</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Form Section */}
        <section className={classes.formSection}>
          <h2>Register New Device</h2>
          {formError && <div className={classes.error}>{formError}</div>}
          {isSubmitting && (
            <div className={classes.spinner}>
              <FaSpinner />
            </div>
          )}
          {formSuccess && <div className={classes.success}>{formSuccess}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className={classes.formGrid}>
            <input {...register("name")} className={classes.input} placeholder="Name" />
            <input {...register("serialNumber")} className={classes.input} placeholder="Serial Number" />
            <select {...register("deviceType")} className={classes.input}>
              <option value="CAMERA">Camera</option>
              <option value="AUDIO_GATEWAY">Audio Gateway</option>
              <option value="ENVIRONMENTAL_SENSOR">Environmental Sensor</option>
            </select>
            <button type="submit" className={classes.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Add Device"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default App;
