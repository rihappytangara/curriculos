(() => {
  "use strict";

  const FORM_ID = "3l3nwgw7o02";
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "txt", "doc", "docx"];

  const form = document.getElementById("application-form");
  const submitButton = document.getElementById("submit-button");
  const buttonText = submitButton.querySelector(".button-text");
  const buttonLoading = submitButton.querySelector(".button-loading");
  const formStatus = document.getElementById("form-status");

  const cpfInput = document.getElementById("cpf");
  const phoneInput = document.getElementById("phone");
  const resumeInput = document.getElementById("resume");
  const dropZone = document.getElementById("drop-zone");
  const fileSelected = document.getElementById("file-selected");
  const fileName = document.getElementById("file-name");
  const fileSize = document.getElementById("file-size");
  const removeFileButton = document.getElementById("remove-file");

  const cityCheckboxes = [...document.querySelectorAll('input[name="fi-checkbox-cidade-interesse"]')];
  const cityCount = document.getElementById("city-count");
  const cityError = document.getElementById("city-error");

  const experience = document.getElementById("experience");
  const motivation = document.getElementById("motivation");
  const experienceCount = document.getElementById("experience-count");
  const motivationCount = document.getElementById("motivation-count");

  document.getElementById("current-year").textContent = new Date().getFullYear();

  function onlyDigits(value) {
    return value.replace(/\D/g, "");
  }

  function formatCPF(value) {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  cpfInput.addEventListener("input", () => {
    cpfInput.value = formatCPF(cpfInput.value);
    clearFieldError(cpfInput);
  });

  function formatPhone(value) {
    let digits = onlyDigits(value);

    // O input representa apenas o DDD + número. O +55 fica fixo visualmente.
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    if (digits.length <= 2) {
      return digits ? `(${digits}` : "";
    }

    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhone(phoneInput.value);
    clearFieldError(phoneInput);
  });

  function selectedCities() {
    return cityCheckboxes.filter((checkbox) => checkbox.checked);
  }

  function updateCityCount() {
    const count = selectedCities().length;
    cityCount.textContent = `${count}/4 selecionadas`;
    cityCount.classList.toggle("limit", count === 4);

    cityCheckboxes.forEach((checkbox) => {
      if (!checkbox.checked) {
        checkbox.disabled = count >= 4;
      } else {
        checkbox.disabled = false;
      }
    });

    if (count > 0) {
      cityError.textContent = "";
    }
  }

  cityCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateCityCount);
  });

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getExtension(name) {
    const parts = name.toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  function validateFile(file) {
    if (!file) {
      return "Anexe seu currículo para continuar.";
    }

    const extension = getExtension(file.name);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return "Formato não permitido. Envie PDF, JPG, PNG, TXT, DOC ou DOCX.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "O arquivo ultrapassa o limite de 25 MB.";
    }

    return "";
  }

  function displayFile(file) {
    const error = validateFile(file);

    if (error) {
      showFileError(error);
      resumeInput.value = "";
      fileSelected.hidden = true;
      return false;
    }

    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    fileSelected.hidden = false;
    clearFileError();
    return true;
  }

  function setFile(file) {
    if (!file) return;

    // DataTransfer permite manter o arquivo selecionado mesmo usando uma área de drop personalizada.
    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      resumeInput.files = dataTransfer.files;
    } catch (error) {
      // Em navegadores que não permitem DataTransfer para inputs,
      // o usuário ainda pode selecionar normalmente pelo campo nativo.
      console.warn("Não foi possível atribuir o arquivo ao input.", error);
    }

    displayFile(file);
  }

  resumeInput.addEventListener("change", () => {
    const file = resumeInput.files[0];
    if (file) displayFile(file);
  });

  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];
    if (file) setFile(file);
  });

  dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      resumeInput.click();
    }
  });

  removeFileButton.addEventListener("click", () => {
    resumeInput.value = "";
    fileSelected.hidden = true;
    clearFileError();
  });

  function updateCounter(textarea, counter) {
    counter.textContent = textarea.value.length;
  }

  experience.addEventListener("input", () => {
    updateCounter(experience, experienceCount);
    clearFieldError(experience);
  });

  motivation.addEventListener("input", () => {
    updateCounter(motivation, motivationCount);
    clearFieldError(motivation);
  });

  function showFieldError(element, message) {
    element.classList.add("invalid");

    const errorElement = document.querySelector(`[data-error-for="${element.id}"]`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearFieldError(element) {
    element.classList.remove("invalid");

    const errorElement = document.querySelector(`[data-error-for="${element.id}"]`);
    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  function showFileError(message) {
    fileError.textContent = message;
    dropZone.classList.add("invalid");
  }

  function clearFileError() {
    fileError.textContent = "";
    dropZone.classList.remove("invalid");
  }

  const fileError = document.getElementById("file-error");

  function validateForm() {
    let valid = true;

    const name = document.getElementById("full-name");

    if (name.value.trim().length < 3) {
      showFieldError(name, "Informe seu nome completo.");
      valid = false;
    } else {
      clearFieldError(name);
    }

    const cpfDigits = onlyDigits(cpfInput.value);

    if (cpfDigits.length !== 11) {
      showFieldError(cpfInput, "Informe um CPF válido com 11 dígitos.");
      valid = false;
    } else {
      clearFieldError(cpfInput);
    }

    const phoneDigits = onlyDigits(phoneInput.value);

    if (phoneDigits.length !== 11) {
      showFieldError(phoneInput, "Informe um telefone celular válido com DDD.");
      valid = false;
    } else {
      clearFieldError(phoneInput);
    }

    if (selectedCities().length === 0) {
      cityError.textContent = "Selecione pelo menos uma cidade.";
      valid = false;
    } else {
      cityError.textContent = "";
    }

    const file = resumeInput.files[0];
    const fileValidation = validateFile(file);

    if (fileValidation) {
      showFileError(fileValidation);
      valid = false;
    } else {
      clearFileError();
    }

    if (experience.value.trim().length < 20) {
      showFieldError(experience, "Conte um pouco mais sobre sua experiência.");
      valid = false;
    } else {
      clearFieldError(experience);
    }

    if (motivation.value.trim().length < 20) {
      showFieldError(motivation, "Conte um pouco mais sobre sua motivação.");
      valid = false;
    } else {
      clearFieldError(motivation);
    }

    if (!valid) {
      const firstInvalid = form.querySelector(".invalid, .field-error:not(:empty)");
      if (firstInvalid) {
        const target = firstInvalid.closest(".field") || firstInvalid;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return valid;
  }

  function setSubmitting(isSubmitting) {
    submitButton.disabled = isSubmitting;
    buttonText.hidden = isSubmitting;
    buttonLoading.hidden = !isSubmitting;
  }

  function showStatus(type, message) {
    formStatus.className = `form-status ${type}`;
    formStatus.textContent = message;
    formStatus.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.className = "form-status";
    formStatus.textContent = "";

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (typeof Forminit === "undefined") {
        throw new Error("O serviço de formulário não foi carregado. Recarregue a página e tente novamente.");
      }

      /*
       * O telefone é enviado no padrão E.164, conforme recomendado pelo Forminit:
       * +55 + DDD + número.
       *
       * O usuário vê +55 (XX) XXXXX-XXXX, mas o Forminit recebe +55XXXXXXXXXXX.
       */
      const phoneE164 = `+55${onlyDigits(phoneInput.value)}`;

      const formData = new FormData(form);

      // Substitui o telefone formatado pelo padrão internacional.
      formData.set("fi-text-telefone", phoneE164);

      const forminit = new Forminit();
      const { data, error } = await forminit.submit(FORM_ID, formData);

      if (error) {
        throw new Error(error.message || "Não foi possível enviar sua candidatura.");
      }

      console.log("Candidatura enviada:", data?.hashId || data);

      showStatus(
        "success",
        "Candidatura enviada com sucesso. Obrigado pelo seu interesse em fazer parte do time Oeste Veículos Chevrolet!"
      );

      form.reset();
      fileSelected.hidden = true;
      clearFileError();
      updateCityCount();
      updateCounter(experience, experienceCount);
      updateCounter(motivation, motivationCount);

    } catch (error) {
      console.error("Erro ao enviar candidatura:", error);
      showStatus(
        "error",
        error.message || "Não foi possível enviar sua candidatura agora. Verifique sua conexão e tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  });

  updateCityCount();
  updateCounter(experience, experienceCount);
  updateCounter(motivation, motivationCount);
})();
